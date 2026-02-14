# TTM Project Status — Last Updated Feb 13, 2026

## HOW TO USE THIS FILE
Claude: Read this FIRST at the start of every conversation. Pull from `schultzdanielj-del/ttm-dashboard/PROJECT-STATUS.md`. Dan doesn't write code — just implement and show results. No enthusiasm, no motivational language. Direct and mechanical.

## REPOSITORIES (all under github.com/schultzdanielj-del)

### 1. ttm-dashboard (React/Vite frontend)
- **Deployed**: Railway at `https://dashboard-production-79f2.up.railway.app/{unique_code}`
- **Main file**: `src/App.tsx` (31KB) — fully wired to live API, no mock data
- **API client**: Direct fetch calls in App.tsx (the `src/api.ts` file exists but is UNUSED)
- **Stack**: React + TypeScript + Vite + Tailwind
- **Config**: `.env` has `VITE_API_URL`

### 2. ttm-metrics-api (FastAPI backend)
- **Deployed**: Railway at `https://ttm-metrics-api-production.up.railway.app`
- **Main file**: `main.py` (40KB, ~1000 lines) — FastAPI v1.3.1
- **Database**: `database.py` — PostgreSQL on Railway, 10 SQLAlchemy models
- **Key endpoint**: `GET /api/dashboard/{unique_code}/full` returns everything in one call
- **Features working**: PR logging, fuzzy exercise matching, workout plans, deload count tracking, core foods toggle, exercise swaps, user notes, 96h session tracking, XP/leveling, member management with unique codes

### 3. discord-bot
- **Main file**: `PRBot.py` (39KB)
- **Supporting**: `exercise_normalization.py`, `fuzzy_matching.py`
- **Note**: Still has legacy `pr_tracker.db` SQLite in repo

### 4. ttm-mcp-test — unused test repo, ignore

## DATABASE TABLES (PostgreSQL on Railway)
PRs, Workouts, WorkoutCompletions, DashboardMembers, CoreFoodsCheckins, UserNotes, ExerciseSwaps, WorkoutSessions, UserXP, WeeklyLogs

## WHAT'S WORKING (in code, needs live verification)
- Full dashboard UI connected to live API (no mock data)
- Single-endpoint data fetch on mount (`/full`)
- Per-exercise logging with real-time PR detection (e1rm comparison)
- Core foods 7-day rolling calendar with tap/double-tap, 3-day edit window
- Exercise swap and revert with DB persistence
- User notes with auto-save on blur
- PR history graphs from real API data
- 96h session tracking (server-side)
- Cycle progress bar (stat panel 0)
- Fuzzy exercise name matching (normalization + abbreviation expansion + similarity scoring)
- Dashboard member system with unique codes and URLs

## WHAT'S NOT DONE YET
1. **Deload cascade** — API just increments completion count and resets on 7-day gap. Missing: first-to-6 triggers cascade, others get 1 more session, 10-day max auto-deload, 7-day inactivity auto-reset
2. **UP NEXT / BEHIND badges** — Frontend hardcodes `workouts[0]` as UP NEXT. No real rotation tracking server-side. Need: sequential A→E tracking, 5-day same-workout lockout, 3-consecutive-day rest nudge, N-1 frequency, BEHIND badge with 3-day catchup
3. **Strength gains panel** — Shows "--" placeholder. Needs cycle-over-cycle e1rm comparison
4. **Hi/Lo PR detection** — Spec describes it (when 5lb increment > 15% of weight, show two PRs) but not implemented
5. **Workout completion increment** — Logging individual exercises works, but nothing increments the deload completion count from the dashboard. The `/log` endpoint logs PRs and tracks sessions but doesn't call workout completion.
6. **"Too heavy" for timed exercises** — Threshold is 60s per spec, partially implemented in frontend

## CRITICAL URLS
- Dashboard (Dan's): `https://dashboard-production-79f2.up.railway.app/{DAN_UNIQUE_CODE}`
- API root: `https://ttm-metrics-api-production.up.railway.app/`
- API docs: `https://ttm-metrics-api-production.up.railway.app/docs`
- Members list: `GET /api/dashboard/members`

## DAN'S PREFERENCES
- Iterates conversationally — Claude handles ALL code, pushes to GitHub
- No copying/pasting, no manual deployment
- Dark theme: #000 bg, Roboto font, mobile-first 430px
- Direct analysis, no enthusiasm or motivational language
- Discord ID: 718992882182258769

## NEXT CONVERSATION STARTUP CHECKLIST
1. Read this file from GitHub
2. Check if Chrome extension is connected — if yes, open Railway dashboard + live dashboard to verify deployment
3. Ask Dan what to work on next
4. At END of conversation, update this file with what changed
