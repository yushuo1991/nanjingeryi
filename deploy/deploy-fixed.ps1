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

function Info([string]$msg) { Write-Host "[deploy] $msg" -ForegroundColor Cyan }
function Success([string]$msg) { Write-Host "[deploy] $msg" -ForegroundColor Green }
function Error([string]$msg) { Write-Host "[deploy] $msg" -ForegroundColor Red }

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
Success "SSH connection successful"

Info "Preparing deployment artifacts..."
$artifactDir = Join-Path (Get-Location) "deploy_artifacts"
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
$archiveName = "$release.tgz"
$archivePath = Join-Path $artifactDir $archiveName

if (Test-Path -LiteralPath $archivePath) {
  Remove-Item -Force -LiteralPath $archivePath
}

Info "Creating archive (this may take a moment)..."
$currentDir = Get-Location

# Use Windows native tar (available in Windows 10+)
Push-Location $currentDir.Path
try {
  $excludes = @(
    "--exclude=.git",
    "--exclude=node_modules",
    "--exclude=dist",
    "--exclude=server/node_modules",
    "--exclude=deploy_artifacts",
    "--exclude=legacy_*"
  )

  # Use Windows tar explicitly (not Git Bash tar)
  & "$env:SystemRoot\System32\tar.exe" -czf $archivePath $excludes .

  if ($LASTEXITCODE -ne 0) { throw "Archive creation failed (exit=$LASTEXITCODE)" }
} finally {
  Pop-Location
}

$archiveSize = (Get-Item $archivePath).Length / 1MB
Success "Archive created: $archiveName ($([Math]::Round($archiveSize, 2)) MB)"

Info "Uploading archive to server..."
& scp -P $Port -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL $archivePath "${User}@${HostName}:/tmp/$archiveName"
if ($LASTEXITCODE -ne 0) { throw "SCP failed (exit=$LASTEXITCODE)" }
Success "Upload complete"

Info "Extracting on server..."
Invoke-Ssh "set -euo pipefail; mkdir -p '$releaseDir'; tar -xzf '/tmp/$archiveName' -C '$releaseDir'; rm -f '/tmp/$archiveName'"
Success "Extraction complete"

$remoteTemplate = @'
set -euo pipefail
cd '__RELEASE_DIR__'
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
mkdir -p '__SHARED_DIR__'
if [ ! -f '__DB_PATH__' ] || [ '__RESET_FLAG__' = '1' ]; then
  cp -f '__RELEASE_DIR__/server/data/db.json' '__DB_PATH__'
  echo "Database initialized/reset"
else
  echo "Keeping existing database"
fi

echo "Creating .env file..."
cat > .env <<EOF
PORT=__API_PORT__
DB_PATH=__DB_PATH__
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
EOF

echo "Linking current release..."
mkdir -p '__BASE_DIR__'
ln -sfn '__RELEASE_DIR__' '__BASE_DIR__/current'

echo "Configuring systemd service..."
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

echo "Configuring Nginx..."
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
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    client_max_body_size 20M;
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
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    client_max_body_size 20M;
  }
}
EOF
fi

chown root:root "/www/server/panel/vhost/nginx/__DOMAIN__.conf" 2>/dev/null || true
chmod 600 "/www/server/panel/vhost/nginx/__DOMAIN__.conf" 2>/dev/null || true

echo "Restarting services..."
systemctl daemon-reload
systemctl enable --now __APP_NAME__
systemctl restart __APP_NAME__

sleep 2
if systemctl is-active --quiet __APP_NAME__; then
  echo "Service __APP_NAME__ is running"
else
  echo "WARNING: Service __APP_NAME__ failed to start"
  systemctl status __APP_NAME__ --no-pager || true
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
echo "Release: __RELEASE_DIR__"
if [ -f "$FULLCHAIN" ] && [ -f "$PRIVKEY" ]; then
  echo "Site URL: https://__DOMAIN__"
  echo "API Health: https://__DOMAIN__/api/health"
else
  echo "Site URL: http://__DOMAIN__"
  echo "API Health: http://__DOMAIN__/api/health"
fi
echo "========================================="
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

Info "Uploading deployment script..."
$remoteScriptLocal = Join-Path $artifactDir "$release.deploy.sh"
$remoteScriptRemote = "/tmp/$release.deploy.sh"
$remoteLf = ($remote -replace "`r`n", "`n")
[System.IO.File]::WriteAllText($remoteScriptLocal, $remoteLf, [System.Text.UTF8Encoding]::new($false))

& scp -P $Port -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL $remoteScriptLocal "${User}@${HostName}:$remoteScriptRemote"
if ($LASTEXITCODE -ne 0) { throw "SCP deploy script failed (exit=$LASTEXITCODE)" }
Success "Script uploaded"

Info "Executing remote deployment (this will take a few minutes)..."
Info "Building frontend and backend on server..."
Invoke-Ssh "bash '$remoteScriptRemote'"
Invoke-Ssh "rm -f '$remoteScriptRemote' || true"

Success "========================================="
Success "Deployment Complete!"
Success "========================================="
Info "Site: https://$Domain (or http:// if no SSL)"
Info "API Health Check: https://$Domain/api/health"
Success "========================================="
