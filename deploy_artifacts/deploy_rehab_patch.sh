#!/usr/bin/env bash
set -euo pipefail
APP=/var/www/rehab-care-link
PKG=/tmp/legacy_ai_patch_quickentry_nav_upload.tgz
TS=$(date +%Y%m%d%H%M%S)
TMP=/tmp/rehab-care-link-patch-$TS
BK=/var/www/rehab-care-link-backup-$TS

[ -f "$PKG" ]
mkdir -p "$TMP"
tar -xzf "$PKG" -C "$TMP"

# backup current app (best-effort)
if [ -d "$APP" ]; then
  cp -a "$APP" "$BK" || true
fi

# preserve env
ENV_KEEP=""
if [ -f "$APP/server/.env" ]; then
  ENV_KEEP="$TMP/.env.keep"
  cp -f "$APP/server/.env" "$ENV_KEEP"
fi

# deploy dist + server
mkdir -p "$APP"
rm -rf "$APP/dist"
cp -a "$TMP/dist" "$APP/dist"
rm -rf "$APP/server"
cp -a "$TMP/server" "$APP/server"

# restore env
if [ -n "$ENV_KEEP" ] && [ -f "$ENV_KEEP" ]; then
  cp -f "$ENV_KEEP" "$APP/server/.env"
  chmod 600 "$APP/server/.env" || true
fi

# ensure uploads exists
mkdir -p "$APP/uploads"

# install backend deps
cd "$APP/server"
npm install --omit=dev

systemctl restart rehab-care-link-ai

# reload nginx
if [ -x "/www/server/nginx/sbin/nginx" ]; then
  /www/server/nginx/sbin/nginx -s reload || true
elif command -v nginx >/dev/null; then
  nginx -s reload || true
fi

curl -sS http://127.0.0.1:3201/api/health || true
echo
