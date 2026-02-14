# TTM Project Status — Last Updated Feb 14, 2026

## HOW TO USE THIS FILE
Claude: Read this FIRST at the start of every conversation. Pull from `schultzdanielj-del/ttm-dashboard/PROJECT-STATUS.md`. Dan doesn't write code — just implement and show results. No enthusiasm, no motivational language. Direct and mechanical.

## WORKFLOW RULES — READ BEFORE DOING ANYTHING
1. **Diagnose first, act second.** When Dan reports a problem, investigate and present findings BEFORE writing or pushing any code.
2. **No pushing to GitHub without explicit approval.** Present the proposed change, wait for Dan to say go. Pushing to main = auto-deploy = production changes. Treat it accordingly.
3. **One thing at a time.** Don't chain multiple fixes together. Fix one thing, confirm it works, then move on.
4. **Show, don't marathon.** After investigating, summarize what you found and what you'd do. Stop. Wait for Dan's go-ahead.
5. **If uncertain, ask.** Don't guess at intent. If the problem could be data vs code vs config, say so and ask which to pursue.
6. **Always explain approach before doing it.** Dan says "go" before execution. Saves tokens and avoids brute forcing.

## REPOSITORIES (all under github.com/schultzdanielj-del)

### 1. ttm-dashboard (React/Vite frontend)
- **Deployed**: Railway at `https://dashboard-production-79f2.up.railway.app/{unique_code}`
- **Main file**: `src/App.tsx` (31KB) — fully wired to live API, no mock data
- **API client**: Direct fetch calls in App.tsx (the `src/api.ts` file exists but is UNUSED)
- **Stack**: React + TypeScript + Vite + Tailwind
- **Config**: `.env` has `VITE_API_URL`

### 2. ttm-metrics-api (FastAPI backend)
- **Deployed**: Railway at `https://ttm-metrics-api-production.up.railway.app`
- **Main file**: `main.py` (~44KB) — FastAPI v1.5.1
- **Database**: `database.py` — PostgreSQL on Railway, 10 SQLAlchemy models
- **Key endpoint**: `GET /api/dashboard/{unique_code}/full` returns everything in one call
- **Scraper**: `scrape_and_reload.py` — standalone script (can also be triggered via admin endpoint)
- **Admin rescrape**: `GET /api/admin/rescrape?key=<ADMIN_KEY>` — wipes Discord-sourced PRs, re-scrapes channel, normalizes, reloads. Preserves Feras + Sonny manual PRs. ADMIN_KEY: `4ifQC_DLzlXM1c5PC6egwvf2p5GgbMR3`
- **Features working**: PR logging, fuzzy exercise matching (aggregates ALL name variants), workout plans, deload count tracking, core foods toggle, exercise swaps, user notes, 96h session tracking, XP/leveling, member management with unique codes
- **Debug endpoint**: `GET /api/debug/{unique_code}/exercise-names` — shows PR name groups and workout plan match results
- **Env vars on Railway**: DATABASE_URL, TTM_BOT_TOKEN (added Feb 14 for rescrape)

### 3. discord-bot
- **Main file**: `PRBot.py` (39KB)
- **Supporting**: `exercise_normalization.py` (canonical normalization rules), `fuzzy_matching.py`
- **All commands use API** (PostgreSQL) — migrated from SQLite on Feb 13
- **XP/weekly logs/core foods** still use local SQLite (bot-specific, not shared)
- **Note**: Legacy `pr_tracker.db` SQLite still in repo (historical artifact, not used)

### 4. ttm-mcp-test — unused test repo, ignore

## DATABASE TABLES (PostgreSQL on Railway)
PRs, Workouts, WorkoutCompletions, DashboardMembers, CoreFoodsCheckins, UserNotes, ExerciseSwaps, WorkoutSessions, UserXP, WeeklyLogs

## CURRENT DATA STATUS — MANUAL PR AUDIT IN PROGRESS

### What happened
The automated scraper was missing PRs due to format variations (e.g. "40 for 17", "50lbs x 13", "Bodyweight x 7", reversed reps/weight). Instead of fixing the parser for edge cases that won't recur once members use the dashboard, we're doing a manual audit: extract each member's Discord posts, normalize by hand with Dan's approval, then replace their DB entries with the approved clean set using original Discord timestamps.

### Audit status
- **Warhound (Travis)**: ✅ APPROVED — 76 PRs. File: `warhound_raw_vs_normalized.txt`
- **Zioz (Dan I)**: ✅ APPROVED — 29 PRs. File: `zioz_raw_vs_normalized.txt`
- **John (simplyhabby)**: ✅ APPROVED — 56 PRs. File: `john_raw_vs_normalized.txt`
- **Dan (coach)**: ❌ NOT STARTED — next session

### What's left after audit completes
1. Wipe each user's existing PRs from DB
2. Insert approved PR sets with correct Discord timestamps (currently all timestamps show rescrape time, not original post time)
3. Fix normalization: ATG split squat must NOT map to bulgarian/rear foot elevated split squat — it's a distinct exercise
4. Verify dashboards show correct data post-insert

### Key findings from audit
- Scraper missed ~70+ Warhound PRs (nearly all of his) due to "Nlbs x N" format
- Scraper missed Dan's "weight for reps" format entries
- John posted reps/weight reversed until ~Jan 27, then switched to correct format
- John's MSG 1-4 were bulk posts from road with substitute equipment
- Zioz's first day (Jan 24) had duplicate format-learning posts that needed dedup
- Source file: `pr_channel_dump.txt` (314 messages from Discord channel 1459000944028028970)

## EXERCISE NORMALIZATION
- **Canonical source**: `discord-bot/exercise_normalization.py` (updated Feb 14)
- **Also embedded in**: `ttm-metrics-api/scrape_and_reload.py` (must stay in sync)
- **Rules developed from**: ~100 Q&A questions with Dan about how exercises should be named
- **Covers**: typo corrections, abbreviation expansion (db/bb/bw/kb/ez/rdl/ohp/etc), equipment synonyms, compound words, plural singularization, position reordering, exercise-specific rules (squats, deadlifts, presses, rows, pulldowns, curls, extensions, etc), incline angle normalization, duplicate word removal
- **TRX auto-append rules removed** (Feb 14) — "trx bicep" and "trx tricep" are too ambiguous to auto-normalize
- **FIX NEEDED**: ATG split squat must not normalize to bulgarian split squat or rear foot elevated split squat. It is a distinct exercise used by multiple members.

## WHAT'S WORKING (verified live Feb 14)
- Full dashboard UI connected to live API (no mock data)
- Single-endpoint data fetch on mount (`/full`)
- Clean PR data with normalized exercise names
- Fuzzy exercise matching connecting workout plan names to PR data (e.g. "Head Supported RDF" → "head supported rear delt fly")
- Per-exercise logging with real-time PR detection (e1rm comparison)
- Core foods 7-day rolling calendar with tap/double-tap, 3-day edit window
- Exercise swap and revert with DB persistence
- User notes with auto-save on blur
- PR history graphs from real API data (aggregates across name variants)
- 96h session tracking (server-side)
- Cycle progress bar (stat panel 0)
- Dashboard member system with unique codes and URLs
- Admin rescrape endpoint (browser-triggered, no CLI needed)

## WHAT'S NOT DONE YET
1. **Deload cascade** — API just increments completion count and resets on 7-day gap. Missing: first-to-6 triggers cascade, others get 1 more session, 10-day max auto-deload, 7-day inactivity auto-reset
2. **UP NEXT / BEHIND badges** — Frontend hardcodes `workouts[0]` as UP NEXT. No real rotation tracking server-side. Need: sequential A→E tracking, 5-day same-workout lockout, 3-consecutive-day rest nudge, N-1 frequency, BEHIND badge with 3-day catchup
3. **Strength gains panel** — Shows "--" placeholder. Needs cycle-over-cycle e1rm comparison
4. **Hi/Lo PR detection** — Spec describes it (when 5lb increment > 15% of weight, show two PRs) but not implemented
5. **Workout completion increment** — Logging individual exercises works, but nothing increments the deload completion count from the dashboard. The `/log` endpoint logs PRs and tracks sessions but doesn't call workout completion.
6. **"Too heavy" for timed exercises** — Threshold is 60s per spec, partially implemented in frontend

## CRITICAL URLS
- Dashboard (Dan's): `https://dashboard-production-79f2.up.railway.app/UUtTjHrS4WP6uQzqd0uPcA`
- API root: `https://ttm-metrics-api-production.up.railway.app/`
- API docs: `https://ttm-metrics-api-production.up.railway.app/docs`
- Members list: `GET /api/dashboard/members`
- Admin rescrape: `GET /api/admin/rescrape?key=4ifQC_DLzlXM1c5PC6egwvf2p5GgbMR3`

## DAN'S PREFERENCES
- Iterates conversationally — Claude handles ALL code, pushes to GitHub
- No copying/pasting, no manual deployment
- Dark theme: #000 bg, Roboto font, mobile-first 430px
- Direct analysis, no enthusiasm or motivational language
- Discord ID: 718992882182258769
- Always explain approach before executing. Dan says "go" before any action.

## NEXT CONVERSATION STARTUP CHECKLIST
1. Read this file from GitHub
2. Read `ttm-dashboard-spec.md` from same repo
3. Check if Chrome extension is connected — if yes, open Railway dashboard + live dashboard to verify deployment
4. Ask Dan what to work on next
5. At END of conversation, update this file with what changed

## NEXT SESSION: COMPLETE THE AUDIT
1. Process Dan's (coach) PRs from pr_channel_dump.txt — same RAW vs NORMALIZED side-by-side process
2. Once Dan approves his list, write the DB insert script for all 4 users
3. Each user: wipe existing PRs, insert approved set with original Discord timestamps
4. Fix ATG split squat normalization in both exercise_normalization.py and scrape_and_reload.py
5. Verify all dashboards

## CHANGE LOG
- **Feb 14, 2026 (session 3)**: Manual PR audit. Extracted raw Discord dump (314 messages). Built approved PR lists for Warhound (76 PRs), Zioz (29 PRs), John (56 PRs) via side-by-side RAW vs NORMALIZED review with Dan. Discovered scraper was missing ~70+ Warhound PRs (lbs x format), Dan's "for" format entries, all of John's reversed-format entries. Dan (coach) PR list still pending — next session. No DB changes made yet. Identified ATG split squat normalization bug.
- **Feb 14, 2026 (session 2)**: Data cleanup complete. Built admin rescrape endpoint (`GET /api/admin/rescrape?key=...`) so Dan doesn't need Railway CLI. Added `requests` to requirements.txt. Added `TTM_BOT_TOKEN` env var to API service. Rescrape wipes only Discord-sourced PRs, preserves Feras (41) + Sonny (23) manual PRs. Ran rescrape: 842 dirty PRs → 267 clean PRs (203 scraped + 64 preserved). 158 unique exercises → 119. Dashboard verified working with clean data. API bumped to v1.5.1.
- **Feb 14, 2026 (session 1)**: Investigated dirty PR data (842 records, 158 exercise names — mix of old un-normalized + scraper output). Root cause: scraper ran with --execute not --wipe. Synced normalization between bot and scraper (bot was using older incomplete rules). Removed TRX auto-append rules from both files. Bot `exercise_normalization.py` now has complete rules from the 100-question session. Next: run scraper with --wipe.
- **Feb 13, 2026 (earlier chat, not this project)**: Scraper built and run. Bot migrated from SQLite to API for all commands. 203 clean PRs loaded. But scraper used --execute not --wipe, leaving old data in place.
- **Feb 13, 2026 (session 2)**: API v1.4.0 — fixed PR history to aggregate across all exercise name variants via `_find_all_matching_names()`. Added debug endpoint. Identified data-only-spans-6-days issue (Feb 8-13).
