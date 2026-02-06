# Deploy Fix Skill

Comprehensive deployment troubleshooting and fix workflow for RehabCareLink.

## Overview

This skill helps diagnose and fix deployment issues by checking GitHub Actions workflows, package configurations, PM2 status, and performing local builds to catch errors before deployment.

## Workflow Steps

### 1. Check GitHub Actions Workflows

First, examine all workflow files to understand the deployment pipeline:

```bash
ls -la .github/workflows/
```

Read key workflow files:
- `deploy.yml` - Main deployment workflow
- `fix-ai-service.yml` - AI service restart workflow
- `emergency-rebuild.yml` - Emergency rebuild workflow
- `fix-mime-db.yml` - Package corruption fix workflow

### 2. Verify Package Configurations

Check both frontend and backend package.json files:

```bash
# Frontend package.json
cat package.json

# Backend package.json
cat server/package.json
```

Verify:
- All dependencies are properly listed
- Build scripts are correct
- Version numbers are valid
- No missing or corrupted entries

### 3. Check PM2 Configuration

Look for PM2 configuration files:

```bash
# Check for ecosystem.config.js or similar
ls -la | grep -i pm2
ls -la server/ | grep -i pm2
```

Review PM2 process configuration in deployment workflow.

### 4. Local Build Test

Run a local build to catch errors before pushing:

```bash
# Install dependencies
npm ci

# Run frontend build
npm run build

# Check if build succeeded
ls -la dist/
```

If build fails, examine error messages and fix issues before proceeding.

### 5. Backend Build Test

Test backend dependencies:

```bash
cd server
npm ci
cd ..
```

Check for any native module compilation errors (especially better-sqlite3).

### 6. Push Changes with Auto-Retry

Push changes to trigger deployment with automatic retry on failure:

```bash
# Add changes
git add .

# Commit with descriptive message
git commit -m "Fix: [describe the fix]"

# Push with retry logic (3 attempts)
for i in 1 2 3; do
  echo "Push attempt $i of 3..."
  if git push origin main; then
    echo "Push successful!"
    break
  else
    if [ $i -lt 3 ]; then
      echo "Push failed, retrying in 5 seconds..."
      sleep 5
    else
      echo "Push failed after 3 attempts. Please check network connection."
      exit 1
    fi
  fi
done
```

### 7. Monitor Deployment Status

After successful push, monitor the deployment:

```bash
# Open GitHub Actions in browser
echo "Monitor deployment at: https://github.com/yushuo1991/nanjingeryi/actions"
```

Watch for:
- Build completion
- Deployment success
- PM2 restart confirmation
- Any error messages in logs

### 8. Verify Deployment

After deployment completes, verify the application:

```bash
# Check test suite
echo "Verify at: http://ey.yushuo.click/test-suite.html"

# Check main application
echo "Verify at: http://ey.yushuo.click"
```

## Common Issues and Fixes

### Issue: Build Fails Locally

**Symptoms**: `npm run build` fails with errors

**Fix**:
1. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
2. Check for syntax errors in source files
3. Verify all imports are correct
4. Check Vite configuration

### Issue: Git Push Timeout

**Symptoms**: Push hangs or times out

**Fix**:
1. The retry loop above handles this automatically
2. If all retries fail, check network connection
3. Try pushing with `--verbose` flag for diagnostics
4. Consider using GitHub CLI: `gh repo sync`

### Issue: PM2 Process Won't Start

**Symptoms**: Deployment succeeds but server doesn't respond

**Fix**:
1. Run "修复AI服务" workflow from GitHub Actions
2. Check PM2 logs in workflow output
3. Verify .env file was created correctly
4. Run "超级紧急修复 - 强制重建" if needed

### Issue: Corrupted Dependencies

**Symptoms**: "Cannot find module" or "Unexpected end of JSON input"

**Fix**:
1. Run "修复损坏的mime-db包" workflow
2. If that fails, run "超级紧急修复 - 强制重建"
3. Check server disk space (should be under 80%)

## Emergency Workflows

When normal deployment fails, use these GitHub Actions workflows:

1. **修复AI服务** - Quick PM2 restart
2. **修复损坏的mime-db包** - Fix corrupted npm packages
3. **超级紧急修复 - 强制重建** - Nuclear option: complete rebuild

Access at: https://github.com/yushuo1991/nanjingeryi/actions

## Checklist

- [ ] Check all workflow files in .github/workflows/
- [ ] Verify package.json configurations (frontend and backend)
- [ ] Review PM2 configuration
- [ ] Run local build test (`npm run build`)
- [ ] Test backend dependencies (`cd server && npm ci`)
- [ ] Push changes with retry logic (3 attempts)
- [ ] Monitor GitHub Actions deployment
- [ ] Verify at test-suite.html
- [ ] Check main application functionality

## Notes

- Always test builds locally before pushing
- Use retry logic for git push due to frequent GitHub timeouts
- Monitor disk space on server (should be under 80%)
- Keep .env secrets in GitHub Secrets, never commit them
- PM2 process name: `rehab-care-link-server`
- Backend port: 3201 (proxied through Nginx on port 80)
