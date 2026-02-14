# TTM Project Status — Last Updated Feb 13, 2026

## HOW TO USE THIS FILE
Claude: Read this FIRST at the start of every conversation. Pull from `schultzdanielj-del/ttm-dashboard/PROJECT-STATUS.md`. Dan doesn't write code — just implement and show results. No enthusiasm, no motivational language. Direct and mechanical.

## WORKFLOW RULES — READ BEFORE DOING ANYTHING
1. **Diagnose first, act second.** When Dan reports a problem, investigate and present findings BEFORE writing or pushing any code.
2. **No pushing to GitHub without explicit approval.** Present the proposed change, wait for Dan to say go. Pushing to main = auto-deploy = production changes. Treat it accordingly.
3. **One thing at a time.** Don't chain multiple fixes together. Fix one thing, confirm it works, then move on.
4. **Show, don't marathon.** After investigating, summarize what you found and what you'd do. Stop. Wait for Dan's go-ahead.
5. **If uncertain, ask.** Don't guess at intent. If the problem could be data vs code vs config, say so and ask which to pursue.

## REPOSITORIES (all under github.com/schultzdanielj-del)

### 1. ttm-dashboard (React/Vite frontend)
- **Deployed**: Railway at `https://dashboard-production-79f2.up.railway.app/{unique_code}`
- **Main file**: `src/App.tsx` (31KB) — fully wired to live API, no mock data
- **API client**: Direct fetch calls in App.tsx (the `src/api.ts` file exists but is UNUSED)
- **Stack**: React + TypeScript + Vite + Tailwind
- **Config**: `.env` has `VITE_API_URL`

### 2. ttm-metrics-api (FastAPI backend)
- **Deployed**: Railway at `https://ttm-metrics-api-production.up.railway.app`
- **Main file**: `main.py` (~42KB) — FastAPI v1.4.0
- **Database**: `database.py` — PostgreSQL on Railway, 10 SQLAlchemy models
- **Key endpoint**: `GET /api/dashboard/{unique_code}/full` returns everything in one call
- **Features working**: PR logging, fuzzy exercise matching (now aggregates ALL name variants), workout plans, deload count tracking, core foods toggle, exercise swaps, user notes, 96h session tracking, XP/leveling, member management with unique codes
- **Debug endpoint**: `GET /api/debug/{unique_code}/exercise-names` — shows PR name groups and workout plan match results

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
- PR history graphs from real API data (now aggregates across name variants)
- 96h session tracking (server-side)
- Cycle progress bar (stat panel 0)
- Fuzzy exercise name matching (normalization + abbreviation expansion + similarity scoring)
- Dashboard member system with unique codes and URLs

## KNOWN DATA ISSUE
- PR table only has data from Feb 8-13, 2026 (486 records, 64 unique exercise names)
- Exercise names are fragmented across variants (e.g. "chest supported dumbbell row" vs "chest supported db rows")
- No historical data before Feb 8 — need to determine if this is expected or if data was lost in a migration
- API v1.4.0 now aggregates across name variants for pr-history and best PR lookups

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

## CHANGE LOG
- **Feb 13, 2026 (session 2)**: API v1.4.0 — fixed PR history to aggregate across all exercise name variants via `_find_all_matching_names()`. Added debug endpoint. Identified data-only-spans-6-days issue (Feb 8-13).
