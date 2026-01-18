#!/usr/bin/env bash
set -euo pipefail
APP=/var/www/rehab-care-link
PKG=/tmp/legacy_ai_patch_force_reupload_noairetain.tgz
TS=20260114171929
TMP=/tmp/rehab-care-link-patch-20260114171929
BK=/var/www/rehab-care-link-backup-20260114171929

test -f ""
mkdir -p ""
tar -xzf "" -C ""

if [ -d "" ]; then cp -a "" "" || true; fi
if [ -f "/server/.env" ]; then cp -f "/server/.env" "/.env.keep"; fi

rm -rf "/dist"
cp -a "/dist" "/dist"
rm -rf "/server"
cp -a "/server" "/server"

if [ -f "/.env.keep" ]; then cp -f "/.env.keep" "/server/.env"; chmod 600 "/server/.env" || true; fi
mkdir -p "/uploads"

cd "/server"
npm install --omit=dev
systemctl restart rehab-care-link-ai
sleep 1
curl -sS http://127.0.0.1:3201/api/health
echo
