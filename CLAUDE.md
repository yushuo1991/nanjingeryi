# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

康复云查房助手 (RehabCareLink) - A rehabilitation ward rounds assistant for the Children's Hospital Rehabilitation Department. Mobile-first React application with Express backend, SQLite database, and AI-powered patient intake using Alibaba Cloud Qwen Vision API.

**Live URL**: http://ey.yushuo.click
**Server**: 107.173.154.147
**Test Suite**: http://ey.yushuo.click/test-suite.html

## Key Commands

### Development
```bash
# Frontend development (runs on port 3000)
npm run dev

# Backend development (runs on port 3201)
npm run server

# Build frontend for production
npm run build

# Preview production build
npm run preview

# Run E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:headless
```

### Server Operations (via GitHub Actions)
Use GitHub Actions workflows instead of direct SSH for all server operations:

- **修复AI服务** - Restart PM2 process when AI API fails
- **自动部署到服务器** - Deploy latest code (auto-triggered on push to main)
- **超级紧急修复 - 强制重建** - Complete server rebuild (nukes node_modules)
- **修复损坏的mime-db包** - Fix corrupted npm packages (common issue on this server)

Access workflows at: https://github.com/yushuo1991/nanjingeryi/actions

## Architecture

### Frontend (React + Vite)
- **Entry**: `src/main.jsx` → `src/App.jsx` → `src/RehabCareLink.jsx`
- **State Management**: React hooks + localStorage (no Redux/Zustand)
- **Styling**: TailwindCSS with mobile-first design
- **Build Output**: `dist/` with timestamped filenames to force cache invalidation

### Backend (Express + SQLite)
- **Entry**: `server/index.js`
- **Port**: 3201 (proxied through Nginx on port 80)
- **Process Manager**: PM2 (`rehab-care-link-server`)
- **Database**: SQLite via better-sqlite3 (migrated from MySQL)
  - Location: `server/rehab_care.db`
  - Migrations: Auto-run in `server/db.js` on startup

### Key Backend Modules
- `server/db.js` - SQLite wrapper mimicking MySQL pool API
- `server/files.js` - File upload handling (multer + sha256)
- `server/qwen.js` - Alibaba Cloud Qwen Vision API client
- `server/seed.js` - Database seeding

### Server File Structure
```
/var/www/rehab-care-link/
├── dist/              # Frontend static files (served by Nginx)
├── server/            # Backend Node.js app
│   ├── .env          # Secrets (created by workflow)
│   ├── index.js
│   ├── db.js
│   ├── files.js
│   ├── qwen.js
│   ├── seed.js
│   └── rehab_care.db  # SQLite database
└── uploads/           # User-uploaded medical images
```

## Critical Implementation Details

### Database Adapter Pattern
The backend was migrated from MySQL to SQLite. `db.js` provides a MySQL-compatible API:
- `query()` returns `[rows, fields]` format to match mysql2
- better-sqlite3 requires spreading params: `stmt.all(...params)`
- Uses CommonJS (`require`) while frontend uses ES modules (`import`)
- Database automatically creates tables on first run via `migrate()` function

### PDF Report Generation
Uses Playwright Chromium to generate A4 black-and-white treatment reports:
- Route: `GET /api/patients/:id/report.pdf`
- Browser instance reused across requests for performance
- Template function: `buildFormalReportHtml()` in `server/index.js`
- Includes patient info, GAS goals, treatment plan, execution log, and signature lines

### Frontend Cache Busting
Vite config adds timestamp to ALL built files to prevent browser caching issues:
```javascript
entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`
```
This is critical because users experienced stale JS after deployments.

### AI API Integration
Uses Alibaba Cloud Qwen-VL (qwen-vl-max-latest) for OCR on medical records:
- API endpoint configured via `DASHSCOPE_API_KEY` in `.env`
- Prompts in `server/qwen.js`: `buildExtractPrompt()`, `buildPlanPrompt()`, `buildAnalyzePrompt()`
- Returns JSON parsed from markdown code blocks
- **Key endpoints**:
  - `POST /api/cases/:id/extract` - Extract patient info from medical records (multi-attempt with retry)
  - `POST /api/cases/:id/analyze` - One-shot extract + plan generation (faster)
  - `POST /api/cases/:id/plan` - Generate rehab plan from extracted profile
- Uses JSON5 library for lenient parsing of malformed model JSON output
- Implements image resizing (max 768px) and quality reduction (55%) via sharp to reduce API payload size

### Deployment Flow
1. Push to main → GitHub Actions triggers
2. Frontend: `npm ci` → `npm run build` → SCP `dist/` to server
3. Backend: SCP `server/` → SSH install deps → PM2 restart
4. `.env` created from GitHub Secrets (`${{ secrets.SERVER_ENV }}`)

### Common Server Issues

**Problem**: "Cannot find module './db'" errors
**Cause**: PM2 caches old code or node_modules corrupted
**Fix**: Run "修复AI服务" workflow or "超级紧急修复"

**Problem**: "mime-db/db.json: Unexpected end of JSON input"
**Cause**: Disk space ran out during npm install (happened when disk was 94% full)
**Fix**: Run "修复损坏的mime-db包" workflow

**Problem**: 500 errors on AI endpoints
**Diagnosis**: Check PM2 logs via "检查AI服务配置" workflow
**Common causes**: Missing .env, corrupted dependencies, db.js not found

## Environment Variables

### Server (.env in server/)
Required:
- `DASHSCOPE_API_KEY` - Alibaba Cloud API key for Qwen Vision
- `PORT` - Backend port (default 3201)

Optional:
- `SQLITE_DB_PATH` - Database location (defaults to ./rehab_care.db)
- `QWEN_MODEL` - Model name (defaults to qwen3-vl-plus)
- `QWEN_TIMEOUT_MS` - API timeout (defaults to 45000ms)
- `MAX_AI_IMAGES` - Max images per API call (defaults to 3)
- `MAX_AI_IMAGE_DIM` - Max image dimension in pixels (defaults to 768)
- `AI_JPEG_QUALITY` - JPEG quality for compression (defaults to 55)
- `CORS_ORIGIN` - CORS allowed origin (defaults to allow all)

Managed via GitHub Secrets as `SERVER_ENV` (multi-line secret).

## Testing

### Automated Test Suite
Browser-based test page at `/test-suite.html`:
- Backend health check
- Create case API
- AI extract API
- Full workflow test (upload → AI recognition)

### Manual Testing Checklist
See DEPLOYMENT.md for complete checklist covering:
- AI智能收治 (AI-powered patient intake)
- 患者管理 (Patient CRUD)
- 批量生成日报 (Batch daily reports)
- 打印功能 (Print reports)
- 角色切换 (Role switching: therapist/doctor)

## Nginx Configuration

Pure Nginx (no control panel) configured in deploy workflow:
- Serves `dist/` for frontend
- Proxies `/api/*` to `http://localhost:3201/api/`
- Serves `/uploads/` from server filesystem
- HTTP only (HTTPS setup blocked by certbot dependency conflicts)
- Config location: `/etc/nginx/sites-available/default`
- Creates custom `mime.types` in workflow to prevent MIME type issues

## Known Constraints

1. **Server disk space**: Previously at 94%, now 51% after removing BaoTa panel
2. **No HTTPS**: certbot installation conflicts with existing nginx
3. **PM2 quirks**: Sometimes requires full process delete/restart instead of reload
4. **better-sqlite3 binary**: Native module, requires rebuild on server architecture
5. **Git push failures**: Frequent timeouts to GitHub (use retry loops in workflows)

## 部署工作流指导 (Deployment Workflow Guidance)

When troubleshooting deployment issues, follow this systematic approach:

### Pre-Deployment Checklist
1. **Verify all deployment scripts and CI/CD configurations first**
   - Check `.github/workflows/*.yml` for GitHub Actions configuration
   - Review `package.json` scripts (build, deploy, server commands)
   - Validate PM2 configuration (ecosystem.config.js or inline config)
   - Confirm environment variables are properly set in GitHub Secrets

2. **For this project specifically**
   - Verify GitHub Actions workflow files in `.github/workflows/`
   - Check `package.json` for correct build and server scripts
   - Ensure PM2 process name matches: `rehab-care-link-server`
   - Validate `.env` creation from `${{ secrets.SERVER_ENV }}`

3. **After fixing deployment configuration**
   - Always verify the fix has been successfully pushed to the repository
   - Check GitHub Actions logs to confirm workflow execution
   - Never mark a deployment task as complete until changes are committed and pushed
   - Run test suite at http://ey.yushuo.click/test-suite.html to verify deployment

### Common Deployment Issues Checklist

**Build Failures:**
- [ ] Check Node.js version compatibility (frontend vs backend)
- [ ] Verify all dependencies are in package.json
- [ ] Confirm build script exists and is correct
- [ ] Check for TypeScript/ESLint errors blocking build

**Deployment Failures:**
- [ ] Verify SSH credentials in GitHub Secrets
- [ ] Check server disk space (should be under 80%)
- [ ] Confirm target directory exists on server
- [ ] Validate file permissions on server

**Runtime Failures:**
- [ ] Check PM2 process status: `pm2 status`
- [ ] Review PM2 logs: `pm2 logs rehab-care-link-server`
- [ ] Verify .env file exists and contains required variables
- [ ] Confirm database file is accessible
- [ ] Check Nginx configuration and restart if needed

**Post-Deployment Verification:**
- [ ] Frontend loads without console errors
- [ ] API health check returns 200: `GET /api/health`
- [ ] Database queries work correctly
- [ ] File uploads function properly
- [ ] AI endpoints respond (if applicable)

## 授权与访问控制调试 (Authorization & Access Control Debugging)

When debugging membership/subscription access issues:

### Dual-Layer Verification
1. **Backend permission logic**
   - Check API route middleware for authentication checks
   - Verify JWT token validation and user session handling
   - Review database queries for user roles and permissions
   - Confirm subscription status checks in API endpoints

2. **Frontend route guards**
   - Inspect React Router guards or protected route components
   - Check localStorage/sessionStorage for auth tokens
   - Verify authentication state management (Context/hooks)
   - Review conditional rendering based on user permissions

### Race Condition Detection
Look for authentication state race conditions that cause page flashing:
- Component mounting before auth state is loaded
- Multiple simultaneous auth checks
- Async token validation not awaited
- Redirect logic executing before permission checks complete

**Common patterns to check:**
```javascript
// Bad: Race condition
useEffect(() => {
  if (!user) navigate('/login');
}, []); // Runs before user loads

// Good: Wait for auth state
useEffect(() => {
  if (authLoaded && !user) navigate('/login');
}, [authLoaded, user]);
```

### Full Authentication Flow Testing
Test the complete flow, not isolated checks:
1. Login → Token generation → Storage
2. Page load → Token retrieval → Validation
3. API request → Token attachment → Backend verification
4. Token expiry → Refresh flow → Re-authentication
5. Logout → Token removal → Redirect

### Subscription Status Caching
Check for caching issues:
- Browser localStorage/sessionStorage caching stale subscription data
- Backend caching subscription status without invalidation
- CDN caching authenticated API responses
- Service worker caching protected resources

**Debug checklist:**
- [ ] Clear all browser storage and test fresh login
- [ ] Verify subscription status API returns current data
- [ ] Check cache headers on subscription endpoints
- [ ] Test subscription upgrade/downgrade flow
- [ ] Verify permission changes reflect immediately

## 网络弹性处理 (Network Resilience Handling)

### Automatic Retry Strategy for Git Operations

When `git push` fails due to network issues, implement automatic retry with exponential backoff:

**Retry Policy:**
- Automatically retry up to 3 times before asking the user
- Use exponential backoff: 2 seconds, 4 seconds, 8 seconds
- Only retry on network-related errors (timeout, connection refused, etc.)
- Do not retry on authentication or permission errors

**Implementation pattern:**
```bash
for i in 1 2 3; do
  git push && break || {
    if [ $i -lt 3 ]; then
      sleep $((2 ** i))
      echo "Retry attempt $((i + 1))/3..."
    else
      echo "Failed after 3 attempts. Please check network connection."
      exit 1
    fi
  }
done
```

### Batch Operations for Network Efficiency

When network errors occur, batch remaining operations to reduce round trips:

**Instead of:**
```bash
git add file1.js
git add file2.js
git add file3.js
git commit -m "message"
git push
```

**Use:**
```bash
git add file1.js file2.js file3.js && git commit -m "message" && git push
```

**For multiple independent operations:**
- Group related file operations together
- Combine git commands with `&&` for sequential execution
- Use parallel tool calls for truly independent operations
- Minimize the number of separate network requests

### Network Error Detection

Recognize these as retriable network errors:
- `fatal: unable to access`: Connection timeout
- `Connection reset by peer`: Network interruption
- `Could not resolve host`: DNS issues
- `Operation timed out`: Request timeout
- `Failed to connect`: Connection refused

Do NOT retry these errors:
- `Authentication failed`: Credential issues
- `Permission denied`: Authorization problems
- `Repository not found`: Invalid repository
- `rejected`: Push conflicts or branch protection

## Development Workflow

1. Make changes locally
2. Test with `npm run dev` (frontend) and `npm run server` (backend)
3. Commit and push to main
4. Auto-deployment triggers
5. Monitor at https://github.com/yushuo1991/nanjingeryi/actions
6. If deployment fails, check logs and use emergency workflows
7. Verify at http://ey.yushuo.click/test-suite.html

## Important Files Not to Modify

- `dist/` - Auto-generated, will be overwritten
- `server/.env` - Created by workflow from secrets
- `server/rehab_care.db` - Production database (backup before migrations)
- `server/node_modules` - Managed by npm, rebuilt on server

## Getting Help

- **Deployment logs**: GitHub Actions → Latest workflow run
- **Server status**: Run "检查AI服务配置" workflow
- **Emergency fixes**: "超级紧急修复 - 强制重建" nukes everything and rebuilds
- **Documentation**: README.md, DEPLOYMENT.md, START.md
