# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

儿童医院管理系统 (Children's Hospital Management System) - a rehabilitation care management system for pediatric hospitals. The system includes patient records management, medical record entry, and rehabilitation care session tracking.

## Development Commands

### Frontend (Vite + React)
```bash
npm install              # Install frontend dependencies
npm run dev              # Start dev server on http://localhost:3000
npm run build            # Build production bundle to dist/
npm run preview          # Preview production build
```

### Backend (Express + Node.js)
```bash
cd server
npm install              # Install backend dependencies
cp .env.example .env     # Create environment file
node index.js            # Start server on http://localhost:3001
```

### Environment Variables (server/.env)
- `PORT=3001` - Backend server port
- `CORS_ORIGIN` - CORS origin (optional, defaults to allow all)
- `DB_PATH` - Custom database file path (optional, defaults to server/data/db.json)
- `DATA_DIR` - Custom data directory (optional, defaults to server/data/)

## Architecture

### Frontend Structure
- **Single-page app with client-side routing**: Uses state-based navigation in `src/App.jsx` (no router library)
- **Main pages**: Dashboard (首页), RehabCare (康复护理), PatientRecords (病历管理)
- **Styling**: TailwindCSS + lucide-react icons
- **API proxy**: Vite proxies `/api/*` to `http://localhost:3001` (configured in `vite.config.js`)

### Backend Architecture
- **Framework**: Express.js with CORS enabled
- **Data persistence**: JSON file-based storage (`server/data/db.json`)
  - Three collections: `patients`, `records`, `rehabSessions`
  - Atomic writes using temp file + rename pattern (see `server/storage.js`)
  - Auto-seeded with demo data on first run

### API Endpoints
All endpoints are defined in `server/app.js`:

**Health & Dashboard**
- `GET /api/health` - Health check
- `GET /api/dashboard` - Dashboard stats (patient count, record count, today's sessions, recent items)

**Patients**
- `GET /api/patients?q=<search>` - List/search patients
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (cascades to records & sessions)

**Medical Records**
- `GET /api/records?patientId=<id>` - List records (optionally filtered by patient)
- `POST /api/records` - Create record

**Rehabilitation Sessions**
- `GET /api/rehab/sessions?date=<YYYY-MM-DD>&patientId=<id>` - List sessions by date
- `POST /api/rehab/sessions` - Create session (prevents duplicates per patient+date)
- `PATCH /api/rehab/sessions/:id` - Update session items/notes (handles completion status)

### ID Generation
- Patient IDs: `pat_<uuid>`
- Record IDs: `rec_<uuid>`
- Rehab session IDs: `rehab_<uuid>`
- Rehab item IDs: `item_<uuid>`

Temporary IDs starting with `tmp_` are replaced with real IDs on save.

### Date Handling
- All dates stored as ISO 8601 strings (`YYYY-MM-DD` for dates, full ISO for timestamps)
- `localIsoDate()` generates local `YYYY-MM-DD` format
- `nowIso()` generates ISO 8601 timestamp with timezone

## Deployment

See `DEPLOYMENT.md` for full production deployment instructions using Nginx + systemd.

**Quick deployment checklist:**
1. Build frontend: `npm run build` (outputs to `dist/`)
2. Configure Nginx to serve `dist/` and proxy `/api/*` to Node backend
3. Set up systemd service for backend or use process manager
4. Ensure `server/data/` directory is writable
5. Configure SSL certificates for HTTPS
6. Verify `/api/health` returns `{"status":"ok"}`

## Key Implementation Notes

- **No database migrations**: Data structure is defined by code in `server/storage.js:createSeedDb()`
- **Patient deletion cascades**: Deleting a patient removes all associated records and rehab sessions
- **Session uniqueness**: One rehab session per patient per date (enforced at API level)
- **Mobile-responsive**: Sidebar collapses on mobile, controlled by `isSidebarOpen` state in App.jsx
