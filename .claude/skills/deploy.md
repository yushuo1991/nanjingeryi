# Deploy Skill

Standard deployment workflow for RehabCareLink. Deploys by pushing to GitHub, which triggers the CI/CD pipeline via GitHub Actions.

## Overview

This skill handles the full deployment cycle: local build verification, committing changes, pushing to GitHub with retry logic, and monitoring the automated deployment. All production changes go through CI/CD — never modify the server directly.

## Critical Rules

- **NEVER** SSH into the production server or modify production files directly
- **NEVER** modify `server/.env` or `server/rehab_care.db` — these are managed on the server
- **NEVER** commit files containing secrets (`.env`, credentials, API keys)
- All deployments go through GitHub Actions automatically on push to `main`

## Workflow Steps

### 1. Verify Local Build

Run the frontend build locally to catch errors before pushing:

```bash
npm run build
```

If the build fails:
- Check error messages for syntax or import issues
- Fix all errors before proceeding
- Re-run `npm run build` to confirm the fix

Verify the build output exists:

```bash
ls dist/
```

### 2. Stage and Commit Changes

Review what will be committed:

```bash
git status
git diff
```

Stage and commit with a descriptive message:

```bash
# Stage specific files (preferred over git add -A)
git add <files>

# Commit with descriptive message
git commit -m "$(cat <<'EOF'
描述: what changed and why
EOF
)"
```

Do NOT stage or commit:
- `server/.env` — secrets managed via GitHub Secrets
- `server/rehab_care.db` — production database
- `node_modules/` or `dist/` — generated files
- Any files containing API keys or credentials

### 3. Push to GitHub with Retry Logic

Push to the main branch with automatic retry on network failure:

```bash
for i in 1 2 3; do
  echo "Push attempt $i of 3..."
  if git push origin main; then
    echo "Push successful!"
    break
  else
    if [ $i -lt 3 ]; then
      echo "Push failed, retrying in $((2 ** i)) seconds..."
      sleep $((2 ** i))
    else
      echo "Push failed after 3 attempts. Please check network connection."
      exit 1
    fi
  fi
done
```

Retriable errors (network issues):
- `fatal: unable to access`
- `Connection reset by peer`
- `Could not resolve host`
- `Operation timed out`

Do NOT retry these errors:
- `Authentication failed`
- `Permission denied`
- `rejected` (push conflicts)

### 4. Monitor Deployment

After a successful push, the GitHub Actions deployment workflow triggers automatically.

Remind the user:

> Monitor deployment progress at: https://github.com/yushuo1991/nanjingeryi/actions

The deployment pipeline will:
1. Build the frontend (`npm run build`)
2. SCP `dist/` and `server/` to the production server
3. Install backend dependencies on the server
4. Create `.env` from GitHub Secrets
5. Restart the PM2 process (`rehab-care-link-server`)

### 5. Verify Deployment

After the GitHub Actions workflow completes, suggest verification:

> Verify the deployment at: http://ey.yushuo.click/test-suite.html

The test suite checks:
- Backend health check
- Create case API
- AI extract API
- Full workflow (upload → AI recognition)

Also check the main application:

> Main application: http://ey.yushuo.click

## Troubleshooting

### Build Fails Locally

- Clear and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for syntax errors in changed files
- Verify all imports resolve correctly

### Push Keeps Failing

- The retry loop handles transient network issues
- If all 3 attempts fail, check internet connectivity
- Try `git push --verbose` for diagnostics

### Deployment Workflow Fails

- Check GitHub Actions logs for the specific error
- Use emergency workflows if needed:
  - **修复AI服务** — Restart PM2 process
  - **修复损坏的mime-db包** — Fix corrupted npm packages
  - **超级紧急修复 - 强制重建** — Complete server rebuild

Access workflows at: https://github.com/yushuo1991/nanjingeryi/actions

## Checklist

- [ ] Run `npm run build` locally and verify it succeeds
- [ ] Review changes with `git status` and `git diff`
- [ ] Stage only relevant files (no secrets, no generated files)
- [ ] Commit with a descriptive message
- [ ] Push to main with retry logic (up to 3 attempts)
- [ ] Remind user to monitor at GitHub Actions
- [ ] Suggest verification at test-suite.html after deployment completes

## Notes

- PM2 process name: `rehab-care-link-server`
- Backend port: 3201 (proxied through Nginx on port 80)
- Frontend uses timestamped filenames for cache busting
- `.env` is created from `${{ secrets.SERVER_ENV }}` during deployment
- Server disk space should stay under 80%
