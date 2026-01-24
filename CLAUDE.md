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
