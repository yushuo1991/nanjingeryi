# AI Service Check Skill

Comprehensive AI service health check and diagnostics workflow for RehabCareLink.

## Overview

This skill performs a complete health check of the AI service infrastructure, including environment configuration, API connectivity, PM2 process status, database connections, and file system permissions.

## Workflow Steps

### 1. Check server/.env File

Verify the environment configuration file exists and contains required variables:

```bash
# Check if .env exists
ls -la server/.env

# Display .env contents (be careful with sensitive data)
cat server/.env

# Or check specific variables without showing values
grep -E "DASHSCOPE_API_KEY|PORT|QWEN_MODEL" server/.env
```

Required variables:
- `DASHSCOPE_API_KEY` - Alibaba Cloud API key for Qwen Vision
- `PORT` - Backend port (should be 3201)

Optional but important:
- `QWEN_MODEL` - Model name (defaults to qwen3-vl-plus)
- `QWEN_TIMEOUT_MS` - API timeout (defaults to 45000ms)
- `MAX_AI_IMAGES` - Max images per API call (defaults to 3)
- `MAX_AI_IMAGE_DIM` - Max image dimension (defaults to 768px)
- `AI_JPEG_QUALITY` - JPEG quality for compression (defaults to 55)

### 2. Test Qwen API Connection

Test the Qwen API connectivity and authentication:

```bash
# Check if qwen.js exists
ls -la server/qwen.js

# Review Qwen API client code
cat server/qwen.js

# Test API connection (if test script exists)
cd server && node -e "
const qwen = require('./qwen.js');
console.log('Testing Qwen API connection...');
// Add test code here
"
```

Look for:
- API endpoint configuration
- Authentication header setup
- Timeout settings
- Error handling
- Retry logic

### 3. Check PM2 Process Status

Verify the PM2 process is running correctly:

```bash
# This requires SSH access to the server
# Use GitHub Actions workflow "检查AI服务配置" instead

# Or check the workflow file
cat .github/workflows/check-ai-service.yml
```

The workflow should check:
- PM2 process list (`pm2 list`)
- Process status (should be "online")
- Memory usage
- CPU usage
- Uptime
- Restart count

Process name: `rehab-care-link-server`

### 4. Verify Database Connection

Check database connectivity and schema:

```bash
# Check if database file exists
ls -la server/rehab_care.db

# Review database connection code
cat server/db.js

# Check for migration errors in recent logs
grep -i "error\|migration\|database" server/logs/*.log 2>/dev/null || echo "No log files found"
```

Verify:
- Database file exists and is readable
- Connection pool is configured correctly
- Migrations have run successfully
- No connection errors in logs

### 5. Check Upload Directory Permissions

Verify the uploads directory has correct permissions:

```bash
# Check uploads directory
ls -la uploads/

# Check directory permissions
stat uploads/ 2>/dev/null || echo "uploads/ directory not found locally"

# Check if directory is writable
test -w uploads/ && echo "uploads/ is writable" || echo "uploads/ is NOT writable"
```

Required:
- Directory must exist
- Must be writable by the Node.js process
- Should contain uploaded medical images

### 6. Test AI Endpoints

Test the AI service endpoints:

```bash
# Check AI endpoint implementations
grep -n "POST.*extract\|POST.*analyze\|POST.*plan" server/index.js

# Review endpoint handlers
grep -A 20 "'/api/cases/:id/extract'" server/index.js
grep -A 20 "'/api/cases/:id/analyze'" server/index.js
grep -A 20 "'/api/cases/:id/plan'" server/index.js
```

Key endpoints:
- `POST /api/cases/:id/extract` - Extract patient info from medical records
- `POST /api/cases/:id/analyze` - One-shot extract + plan generation
- `POST /api/cases/:id/plan` - Generate rehab plan from extracted profile

### 7. Check Dependencies

Verify all required dependencies are installed:

```bash
# Check package.json for AI-related dependencies
grep -E "dashscope|qwen|openai|anthropic" server/package.json

# Check for image processing dependencies
grep -E "sharp|jimp|multer" server/package.json

# Check for JSON parsing dependencies
grep -E "json5" server/package.json

# Verify node_modules exists
ls -la server/node_modules/ | head -20
```

Critical dependencies:
- `sharp` - Image resizing and compression
- `multer` - File upload handling
- `json5` - Lenient JSON parsing
- `better-sqlite3` - Database driver

### 8. Review Recent Error Logs

Check for recent errors in the application:

```bash
# Check PM2 logs (via GitHub Actions workflow)
# Or review local logs if available

# Search for AI-related errors in code
grep -r "catch.*error\|throw.*error" server/qwen.js server/index.js | grep -i "ai\|qwen\|extract\|analyze"

# Check for common error patterns
grep -r "Cannot find module\|ENOENT\|EACCES\|timeout\|ETIMEDOUT" server/ --include="*.js"
```

Common errors:
- "Cannot find module './db'" - PM2 cache issue
- "Unexpected end of JSON input" - Corrupted dependencies
- "ETIMEDOUT" - API timeout issues
- "ENOENT" - Missing files
- "EACCES" - Permission issues

## Diagnostic Checklist

- [ ] Verify server/.env exists and contains DASHSCOPE_API_KEY
- [ ] Check PORT is set to 3201
- [ ] Review Qwen API client configuration (server/qwen.js)
- [ ] Verify API timeout settings (default 45000ms)
- [ ] Check image processing settings (max dimension, quality)
- [ ] Verify PM2 process is running (use GitHub Actions workflow)
- [ ] Check PM2 process name is "rehab-care-link-server"
- [ ] Verify database file exists (server/rehab_care.db)
- [ ] Check database connection code (server/db.js)
- [ ] Verify uploads/ directory exists and is writable
- [ ] Review AI endpoint implementations
- [ ] Check all dependencies are installed
- [ ] Verify sharp and json5 are present
- [ ] Review recent error logs
- [ ] Test API connectivity (if possible)

## Common Issues and Fixes

### Issue 1: Missing .env File

**Symptoms**:
- 500 errors on AI endpoints
- "DASHSCOPE_API_KEY is not defined" errors

**Fix**:
1. Check GitHub Secrets contains `SERVER_ENV`
2. Run deployment workflow to recreate .env
3. Verify .env is created in server/ directory

### Issue 2: API Timeout

**Symptoms**:
- Requests to AI endpoints hang
- "ETIMEDOUT" errors in logs
- Requests take longer than 45 seconds

**Fix**:
1. Increase `QWEN_TIMEOUT_MS` in .env
2. Reduce `MAX_AI_IMAGES` to process fewer images
3. Reduce `MAX_AI_IMAGE_DIM` to send smaller images
4. Check network connectivity to Alibaba Cloud

### Issue 3: PM2 Process Not Running

**Symptoms**:
- Server doesn't respond
- Connection refused errors
- No process in PM2 list

**Fix**:
1. Run "修复AI服务" GitHub Actions workflow
2. Check PM2 logs for startup errors
3. Verify .env file exists
4. Check for port conflicts (port 3201)
5. Run "超级紧急修复 - 强制重建" if needed

### Issue 4: Database Connection Failed

**Symptoms**:
- "SQLITE_CANTOPEN" errors
- "database is locked" errors
- 500 errors on all endpoints

**Fix**:
1. Verify server/rehab_care.db exists
2. Check file permissions
3. Ensure no other process is locking the database
4. Check disk space (should be under 80%)
5. Review migration errors in logs

### Issue 5: Upload Directory Not Writable

**Symptoms**:
- File upload fails
- "EACCES" permission errors
- Cannot save uploaded images

**Fix**:
1. Create uploads/ directory if missing
2. Set correct permissions: `chmod 755 uploads/`
3. Verify Node.js process user has write access
4. Check disk space

### Issue 6: Corrupted Dependencies

**Symptoms**:
- "Cannot find module" errors
- "Unexpected end of JSON input" in mime-db
- Module import failures

**Fix**:
1. Run "修复损坏的mime-db包" workflow
2. If that fails, run "超级紧急修复 - 强制重建"
3. Check disk space before npm install

### Issue 7: Image Processing Fails

**Symptoms**:
- Sharp errors
- "Input buffer contains unsupported image format"
- Image upload succeeds but processing fails

**Fix**:
1. Verify sharp is installed: `npm list sharp`
2. Rebuild native modules: `npm rebuild sharp`
3. Check image format is supported (JPEG, PNG)
4. Verify MAX_AI_IMAGE_DIM is reasonable (768px)
5. Check AI_JPEG_QUALITY is between 1-100

## GitHub Actions Workflows

Use these workflows for server diagnostics:

1. **检查AI服务配置** - Check PM2 status and logs
2. **修复AI服务** - Restart PM2 process
3. **修复损坏的mime-db包** - Fix corrupted packages
4. **超级紧急修复 - 强制重建** - Complete rebuild

Access at: https://github.com/yushuo1991/nanjingeryi/actions

## Test Suite

After fixes, verify using the test suite:

```bash
echo "Test at: http://ey.yushuo.click/test-suite.html"
```

Tests include:
- Backend health check
- Create case API
- AI extract API
- Full workflow (upload → AI recognition)

## Environment Variables Reference

```bash
# Required
DASHSCOPE_API_KEY=sk-xxxxx
PORT=3201

# Optional (with defaults)
QWEN_MODEL=qwen3-vl-plus
QWEN_TIMEOUT_MS=45000
MAX_AI_IMAGES=3
MAX_AI_IMAGE_DIM=768
AI_JPEG_QUALITY=55
CORS_ORIGIN=*
SQLITE_DB_PATH=./rehab_care.db
```

## Notes

- Always check .env first - most AI issues are configuration problems
- PM2 process must be running for AI endpoints to work
- Image processing requires sharp native module
- API timeouts can be adjusted but affect user experience
- Database must be writable by Node.js process
- Uploads directory must exist and be writable
- Use GitHub Actions workflows for server diagnostics
- Test suite provides quick health check
