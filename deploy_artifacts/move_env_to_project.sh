#!/usr/bin/env bash
set -euo pipefail

# Ensure project env file exists in a user-visible location
install -d -m 755 /var/www/rehab-care-link/server
if [ -f /etc/rehab-care-link-ai.env ]; then
  cp -f /etc/rehab-care-link-ai.env /var/www/rehab-care-link/server/.env
else
  cat > /var/www/rehab-care-link/server/.env <<'EOF'
PORT=3201
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=rehab_care_link
MYSQL_USER=rehab_ai_user
MYSQL_PASSWORD=
UPLOAD_DIR=/var/www/rehab-care-link/uploads
QWEN_MODEL=qwen3-vl-plus
DASHSCOPE_API_KEY=
EOF
fi
chmod 600 /var/www/rehab-care-link/server/.env

# Point systemd to project env file so it is easy to find/edit
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
systemctl restart rehab-care-link-ai
systemctl --no-pager --full status rehab-care-link-ai | head -n 15

echo "Env file is now: /var/www/rehab-care-link/server/.env"