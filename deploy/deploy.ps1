param(
  [string]$HostName = "107.173.154.147",
  [string]$User = "root",
  [int]$Port = 22,
  [string]$Domain = "ey.yushuo.click",
  [string]$AppName = "ey-hospital",
  [string]$BaseDir = "/opt/ey-hospital",
  [int]$ApiPort = 3101,
  [int]$ResetDemoData = 1
)

$ErrorActionPreference = "Stop"

function Info([string]$msg) { Write-Host "[deploy] $msg" }

function Invoke-Ssh([string]$RemoteCommand) {
  $sshArgs = @(
    "-p", "$Port",
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=NUL",
    "$User@$HostName",
    $RemoteCommand
  )
  & ssh @sshArgs
  if ($LASTEXITCODE -ne 0) { throw "SSH command failed (exit=$LASTEXITCODE)" }
}

$ts = (Get-Date).ToString("yyyyMMddHHmmss")
$release = "$AppName-$ts"
$releaseDir = "$BaseDir/releases/$release"
$sharedDir = "$BaseDir/shared"
$dbPath = "$sharedDir/db.json"
$resetFlag = if ($ResetDemoData -ne 0) { "1" } else { "" }

Info "Checking SSH connectivity..."
Invoke-Ssh "echo connected"

Info "Uploading source to $releaseDir ..."
$artifactDir = Join-Path (Get-Location) "deploy_artifacts"
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
$archivePath = Join-Path $artifactDir "$release.tgz"

if (Test-Path -LiteralPath $archivePath) { Remove-Item -Force -LiteralPath $archivePath }

Info "Creating archive $archivePath ..."
tar -czf $archivePath --exclude=.git --exclude=node_modules --exclude=dist --exclude=server/node_modules --exclude=deploy_artifacts .

Info "Copying archive to server..."
& scp -P $Port -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL $archivePath "${User}@${HostName}:/tmp/$release.tgz"
if ($LASTEXITCODE -ne 0) { throw "SCP failed (exit=$LASTEXITCODE)" }

Info "Extracting on server..."
Invoke-Ssh "set -euo pipefail; mkdir -p '$releaseDir'; tar -xzf '/tmp/$release.tgz' -C '$releaseDir'; rm -f '/tmp/$release.tgz'"

$remoteTemplate = @'
set -euo pipefail
cd '__RELEASE_DIR__'
command -v node >/dev/null
command -v npm >/dev/null

rm -rf dist || true
npm install
npm run build

cd server
npm install --omit=dev

mkdir -p '__SHARED_DIR__'
if [ ! -f '__DB_PATH__' ] || [ '__RESET_FLAG__' = '1' ]; then
  cp -f '__RELEASE_DIR__/server/data/db.json' '__DB_PATH__'
fi

cat > .env <<EOF
PORT=__API_PORT__
DB_PATH=__DB_PATH__
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
EOF

mkdir -p '__BASE_DIR__'
ln -sfn '__RELEASE_DIR__' '__BASE_DIR__/current'

if [ -f "/etc/systemd/system/__APP_NAME__.service" ]; then
  cp "/etc/systemd/system/__APP_NAME__.service" "/etc/systemd/system/__APP_NAME__.service.bak" || true
fi

cat > /etc/systemd/system/__APP_NAME__.service <<'EOF'
[Unit]
Description=Children Hospital Server (__APP_NAME__)
After=network.target

[Service]
WorkingDirectory=__BASE_DIR__/current/server
Environment=NODE_ENV=production
EnvironmentFile=__BASE_DIR__/current/server/.env
ExecStart=/usr/bin/node __BASE_DIR__/current/server/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

mkdir -p "/www/server/panel/vhost/nginx"

if [ -f "/www/server/panel/vhost/nginx/__DOMAIN__.conf" ]; then
  cp "/www/server/panel/vhost/nginx/__DOMAIN__.conf" "/www/server/panel/vhost/nginx/__DOMAIN__.conf.bak" || true
fi

CERT_DIR="/www/server/panel/vhost/cert/__DOMAIN__"
FULLCHAIN="${CERT_DIR}/fullchain.pem"
PRIVKEY="${CERT_DIR}/privkey.pem"

if [ -f "$FULLCHAIN" ] && [ -f "$PRIVKEY" ]; then
  echo "SSL cert found: enabling HTTPS (80->443 redirect)"
  cat > "/www/server/panel/vhost/nginx/__DOMAIN__.conf" <<EOF
server {
  listen 80;
  server_name __DOMAIN__;
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  server_name __DOMAIN__;

  ssl_certificate ${FULLCHAIN};
  ssl_certificate_key ${PRIVKEY};

  root __BASE_DIR__/current/dist;
  index index.html;

  location / {
    try_files \$uri \$uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:__API_PORT__/api/;
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
  cat > "/www/server/panel/vhost/nginx/__DOMAIN__.conf" <<EOF
server {
  listen 80;
  server_name __DOMAIN__;

  root __BASE_DIR__/current/dist;
  index index.html;

  location / {
    try_files \$uri \$uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:__API_PORT__/api/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF
fi

chown root:root "/www/server/panel/vhost/nginx/__DOMAIN__.conf"
chmod 600 "/www/server/panel/vhost/nginx/__DOMAIN__.conf"

systemctl daemon-reload
systemctl enable --now __APP_NAME__
systemctl restart __APP_NAME__

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

echo "Deployed release: __RELEASE_DIR__"
if [ -f "$FULLCHAIN" ] && [ -f "$PRIVKEY" ]; then
  echo "Site: https://__DOMAIN__"
else
  echo "Site: http://__DOMAIN__"
fi
'@

$remote = $remoteTemplate.
  Replace('__RELEASE_DIR__', $releaseDir).
  Replace('__SHARED_DIR__', $sharedDir).
  Replace('__DB_PATH__', $dbPath).
  Replace('__RESET_FLAG__', $resetFlag).
  Replace('__API_PORT__', "$ApiPort").
  Replace('__BASE_DIR__', $BaseDir).
  Replace('__APP_NAME__', $AppName).
  Replace('__DOMAIN__', $Domain)

Info "Uploading deploy script..."
$remoteScriptLocal = Join-Path $artifactDir "$release.deploy.sh"
$remoteScriptRemote = "/tmp/$release.deploy.sh"
$remoteLf = ($remote -replace "`r`n", "`n")
[System.IO.File]::WriteAllText($remoteScriptLocal, $remoteLf, [System.Text.UTF8Encoding]::new($false))

& scp -P $Port -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL $remoteScriptLocal "${User}@${HostName}:$remoteScriptRemote"
if ($LASTEXITCODE -ne 0) { throw "SCP deploy script failed (exit=$LASTEXITCODE)" }

Info "Installing dependencies and building on server..."
Invoke-Ssh "bash '$remoteScriptRemote'"
Invoke-Ssh "rm -f '$remoteScriptRemote' || true"

Info "Done. Reminder: set OCR keys in $BaseDir/current/server/.env if needed."
