#!/usr/bin/env bash
set -euo pipefail

DB=rehab_care_link
USER=rehab_ai_user
PASS=$(openssl rand -hex 16)

mysql --defaults-file=/etc/mysql/debian.cnf -e "CREATE DATABASE IF NOT EXISTS \`${DB}\` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;"
mysql --defaults-file=/etc/mysql/debian.cnf -e "CREATE USER IF NOT EXISTS '${USER}'@'localhost' IDENTIFIED BY '${PASS}';"
mysql --defaults-file=/etc/mysql/debian.cnf -e "GRANT ALL PRIVILEGES ON \`${DB}\`.* TO '${USER}'@'localhost'; FLUSH PRIVILEGES;"

install -d -m 700 /var/www/rehab-care-link/server
install -d -m 755 /var/www/rehab-care-link/uploads

ENV=/var/www/rehab-care-link/server/.env
cat > "$ENV" <<EOF
PORT=3201
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=${DB}
MYSQL_USER=${USER}
MYSQL_PASSWORD=${PASS}
UPLOAD_DIR=/var/www/rehab-care-link/uploads
QWEN_MODEL=qwen3-vl-plus
DASHSCOPE_API_KEY=
EOF
chmod 600 "$ENV"

cat > /etc/systemd/system/rehab-care-link-ai.service <<'EOF'
[Unit]
Description=RehabCareLink AI Server
After=network.target mysql.service

[Service]
WorkingDirectory=/var/www/rehab-care-link/server
Environment=NODE_ENV=production
EnvironmentFile=/var/www/rehab-care-link/server/.env
ExecStart=/usr/bin/node /var/www/rehab-care-link/server/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now rehab-care-link-ai
systemctl restart rehab-care-link-ai
systemctl --no-pager --full status rehab-care-link-ai | head -n 25

echo "NOTE: Set DASHSCOPE_API_KEY in /var/www/rehab-care-link/server/.env"