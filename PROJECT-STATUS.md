# TTM Project Status — Last Updated Feb 14, 2026

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
- **Scraper**: `scrape_and_reload.py` — wipes PR table and re-scrapes Discord PR channel through normalization. Run with `railway run python scrape_and_reload.py --wipe`
- **Features working**: PR logging, fuzzy exercise matching (now aggregates ALL name variants), workout plans, deload count tracking, core foods toggle, exercise swaps, user notes, 96h session tracking, XP/leveling, member management with unique codes
- **Debug endpoint**: `GET /api/debug/{unique_code}/exercise-names` — shows PR name groups and workout plan match results

### 3. discord-bot
- **Main file**: `PRBot.py` (39KB)
- **Supporting**: `exercise_normalization.py` (canonical normalization rules), `fuzzy_matching.py`
- **All commands use API** (PostgreSQL) — migrated from SQLite on Feb 13
- **XP/weekly logs/core foods** still use local SQLite (bot-specific, not shared)
- **Note**: Legacy `pr_tracker.db` SQLite still in repo (historical artifact, not used)

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

## CRITICAL DATA STATUS — PR TABLE IS DIRTY
- **842 PRs** currently in database, **158 unique exercise names** — this is wrong
- Data is a mix of: old un-normalized records (Feb 8, title-cased names like "Flat DB Bench Press"), organic bot logging (Feb 9-12), and scraper output (Feb 13, lowercase normalized names)
- The scraper ran on Feb 13 with `--execute` instead of `--wipe`, so it added records on top of the old mess instead of replacing them
- **Fix**: Run `scrape_and_reload.py --wipe` via Railway CLI. This will wipe all 842 records, re-scrape the Discord PR channel (Jan 10 - present), and reload through the normalization function. Expected result: ~200-250 clean PRs, ~75-80 unique exercises
- **Normalization is now synced**: Bot's `exercise_normalization.py` and scraper's inline normalization are identical as of Feb 14. Both had TRX auto-append rules removed (too ambiguous)
- **Message IDs**: Current data has 0 unique message_ids stored — the `message_id` field is empty on old records. The scraper will fix this.

## EXERCISE NORMALIZATION
- **Canonical source**: `discord-bot/exercise_normalization.py` (updated Feb 14)
- **Also embedded in**: `ttm-metrics-api/scrape_and_reload.py` (must stay in sync)
- **Rules developed from**: ~100 Q&A questions with Dan about how exercises should be named
- **Covers**: typo corrections, abbreviation expansion (db/bb/bw/kb/ez/rdl/ohp/etc), equipment synonyms, compound words, plural singularization, position reordering, exercise-specific rules (squats, deadlifts, presses, rows, pulldowns, curls, extensions, etc), incline angle normalization, duplicate word removal
- **TRX auto-append rules removed** (Feb 14) — "trx bicep" and "trx tricep" are too ambiguous to auto-normalize

## WHAT'S NOT DONE YET
1. **Deload cascade** — API just increments completion count and resets on 7-day gap. Missing: first-to-6 triggers cascade, others get 1 more session, 10-day max auto-deload, 7-day inactivity auto-reset
2. **UP NEXT / BEHIND badges** — Frontend hardcodes `workouts[0]` as UP NEXT. No real rotation tracking server-side. Need: sequential A→E tracking, 5-day same-workout lockout, 3-consecutive-day rest nudge, N-1 frequency, BEHIND badge with 3-day catchup
3. **Strength gains panel** — Shows "--" placeholder. Needs cycle-over-cycle e1rm comparison
4. **Hi/Lo PR detection** — Spec describes it (when 5lb increment > 15% of weight, show two PRs) but not implemented
5. **Workout completion increment** — Logging individual exercises works, but nothing increments the deload completion count from the dashboard. The `/log` endpoint logs PRs and tracks sessions but doesn't call workout completion.
6. **"Too heavy" for timed exercises** — Threshold is 60s per spec, partially implemented in frontend

## IMMEDIATE NEXT STEPS
1. **Run the scraper** — `railway run python scrape_and_reload.py --wipe` to get clean data
2. **Verify bot redeploy** — Bot pushed to main with updated normalization, should auto-deploy on Railway. Verify new PRs use correct normalization
3. **Verify dashboard** — After scrape, check that PR history graphs and best-PR lookups show clean data

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
2. Read `ttm-dashboard-spec.md` from same repo
3. Check if Chrome extension is connected — if yes, open Railway dashboard + live dashboard to verify deployment
4. Ask Dan what to work on next
5. At END of conversation, update this file with what changed

## CHANGE LOG
- **Feb 14, 2026**: Investigated dirty PR data (842 records, 158 exercise names — mix of old un-normalized + scraper output). Root cause: scraper ran with --execute not --wipe. Synced normalization between bot and scraper (bot was using older incomplete rules). Removed TRX auto-append rules from both files. Bot `exercise_normalization.py` now has complete rules from the 100-question session. Next: run scraper with --wipe.
- **Feb 13, 2026 (earlier chat, not this project)**: Scraper built and run. Bot migrated from SQLite to API for all commands. 203 clean PRs loaded. But scraper used --execute not --wipe, leaving old data in place.
- **Feb 13, 2026 (session 2)**: API v1.4.0 — fixed PR history to aggregate across all exercise name variants via `_find_all_matching_names()`. Added debug endpoint. Identified data-only-spans-6-days issue (Feb 8-13).
