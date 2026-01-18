set -euo pipefail
cd '/opt/ey-hospital/releases/ey-hospital-20260117091729'
command -v node >/dev/null || { echo "Node.js not found"; exit 1; }
command -v npm >/dev/null || { echo "npm not found"; exit 1; }

echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
rm -rf dist || true
npm run build

echo "Installing backend dependencies..."
cd server
npm install --omit=dev

echo "Setting up shared data directory..."
mkdir -p '/opt/ey-hospital/shared'
if [ ! -f '/opt/ey-hospital/shared/db.json' ] || [ '1' = '1' ]; then
  cp -f '/opt/ey-hospital/releases/ey-hospital-20260117091729/server/data/db.json' '/opt/ey-hospital/shared/db.json'
  echo "Database initialized/reset"
else
  echo "Keeping existing database"
fi

echo "Creating .env file..."
cat > .env <<EOF
PORT=3101
DB_PATH=/opt/ey-hospital/shared/db.json
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
EOF

echo "Linking current release..."
mkdir -p '/opt/ey-hospital'
ln -sfn '/opt/ey-hospital/releases/ey-hospital-20260117091729' '/opt/ey-hospital/current'

echo "Configuring systemd service..."
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

echo "Configuring Nginx..."
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
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    client_max_body_size 20M;
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
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    client_max_body_size 20M;
  }
}
EOF
fi

chown root:root "/www/server/panel/vhost/nginx/ey.yushuo.click.conf" 2>/dev/null || true
chmod 600 "/www/server/panel/vhost/nginx/ey.yushuo.click.conf" 2>/dev/null || true

echo "Restarting services..."
systemctl daemon-reload
systemctl enable --now ey-hospital
systemctl restart ey-hospital

sleep 2
if systemctl is-active --quiet ey-hospital; then
  echo "Service ey-hospital is running"
else
  echo "WARNING: Service ey-hospital failed to start"
  systemctl status ey-hospital --no-pager || true
fi

echo "Reloading Nginx..."
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

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo "Release: /opt/ey-hospital/releases/ey-hospital-20260117091729"
if [ -f "$FULLCHAIN" ] && [ -f "$PRIVKEY" ]; then
  echo "Site URL: https://ey.yushuo.click"
  echo "API Health: https://ey.yushuo.click/api/health"
else
  echo "Site URL: http://ey.yushuo.click"
  echo "API Health: http://ey.yushuo.click/api/health"
fi
echo "========================================="