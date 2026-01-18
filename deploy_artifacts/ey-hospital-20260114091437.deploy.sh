set -euo pipefail
cd '/opt/ey-hospital/releases/ey-hospital-20260114091437'
command -v node >/dev/null
command -v npm >/dev/null

rm -rf dist || true
npm install
npm run build

cd server
npm install --omit=dev

mkdir -p '/opt/ey-hospital/shared'
if [ ! -f '/opt/ey-hospital/shared/db.json' ] || [ '' = '1' ]; then
  cp -f '/opt/ey-hospital/releases/ey-hospital-20260114091437/server/data/db.json' '/opt/ey-hospital/shared/db.json'
fi

cat > .env <<EOF
PORT=3101
DB_PATH=/opt/ey-hospital/shared/db.json
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
EOF

mkdir -p '/opt/ey-hospital'
ln -sfn '/opt/ey-hospital/releases/ey-hospital-20260114091437' '/opt/ey-hospital/current'

if [ -f "/etc/systemd/system/ey-hospital.service" ]; then
  cp "/etc/systemd/system/ey-hospital.service" "/etc/systemd/system/ey-hospital.service.bak" || true
fi

cat > /etc/systemd/system/ey-hospital.service <<'EOF'
[Unit]
Description=Children Hospital Server (ey-hospital)
After=network.target

[Service]
WorkingDirectory=/opt/ey-hospital/current/server
Environment=NODE_ENV=production
EnvironmentFile=/opt/ey-hospital/current/server/.env
ExecStart=/usr/bin/node /opt/ey-hospital/current/server/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

mkdir -p "/www/server/panel/vhost/nginx"

if [ -f "/www/server/panel/vhost/nginx/ey.yushuo.click.conf" ]; then
  cp "/www/server/panel/vhost/nginx/ey.yushuo.click.conf" "/www/server/panel/vhost/nginx/ey.yushuo.click.conf.bak" || true
fi

CERT_DIR="/www/server/panel/vhost/cert/ey.yushuo.click"
FULLCHAIN="${CERT_DIR}/fullchain.pem"
PRIVKEY="${CERT_DIR}/privkey.pem"

if [ -f "$FULLCHAIN" ] && [ -f "$PRIVKEY" ]; then
  echo "SSL cert found: enabling HTTPS (80->443 redirect)"
  cat > "/www/server/panel/vhost/nginx/ey.yushuo.click.conf" <<EOF
server {
  listen 80;
  server_name ey.yushuo.click;
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  server_name ey.yushuo.click;

  ssl_certificate ${FULLCHAIN};
  ssl_certificate_key ${PRIVKEY};

  root /opt/ey-hospital/current/dist;
  index index.html;

  location / {
    try_files \$uri \$uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3101/api/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF
else
  echo "No SSL cert found in $CERT_DIR; enabling HTTP only (port 80)."
  cat > "/www/server/panel/vhost/nginx/ey.yushuo.click.conf" <<EOF
server {
  listen 80;
  server_name ey.yushuo.click;

  root /opt/ey-hospital/current/dist;
  index index.html;

  location / {
    try_files \$uri \$uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3101/api/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF
fi

chown root:root "/www/server/panel/vhost/nginx/ey.yushuo.click.conf"
chmod 600 "/www/server/panel/vhost/nginx/ey.yushuo.click.conf"

systemctl daemon-reload
systemctl enable --now ey-hospital
systemctl restart ey-hospital

nginx -t
if command -v systemctl >/dev/null && systemctl is-active nginx >/dev/null 2>&1; then
  systemctl reload nginx
elif [ -x "/www/server/nginx/sbin/nginx" ]; then
  /www/server/nginx/sbin/nginx -s reload
elif command -v nginx >/dev/null; then
  nginx -s reload
elif [ -x "/etc/init.d/nginx" ]; then
  /etc/init.d/nginx reload
fi

echo "Deployed release: /opt/ey-hospital/releases/ey-hospital-20260114091437"
if [ -f "$FULLCHAIN" ] && [ -f "$PRIVKEY" ]; then
  echo "Site: https://ey.yushuo.click"
else
  echo "Site: http://ey.yushuo.click"
fi