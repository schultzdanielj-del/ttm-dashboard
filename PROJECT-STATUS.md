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

## CLAUDE ACCESS MODEL — WHAT WORKS, WHAT DOESN'T

### ✅ Fully working
- **GitHub read/write** on all repos (discord-bot, ttm-metrics-api, ttm-dashboard) — push to main = auto-deploy
- **API repo in sync with production** — main.py is the full 47KB v1.5.6 with all routes + admin_rebuild. Safe to push changes.
- **Discord bot repo in sync** — PRBot.py is 39KB, full code, confirmed matching deployed version.
- **API access via curl** — can hit all endpoints from bash container
- **Dashboard access via curl** — can fetch frontend from bash container
- **Direct PostgreSQL access** — DATABASE_PUBLIC_URL is stored in Claude memory. Domain `shuttle.proxy.rlwy.net` is on the allowlist. Works from bash with psycopg2.
- **Railway API token** — stored in Claude memory. Domain `backboard-v3.railway.app` is on the allowlist. Use for GraphQL API to check deploys, restart services, read logs.
- **Admin config endpoint** — `GET /api/admin/config?key=<ADMIN_KEY>` returns bot token and admin key from env vars.
- **Admin SQL endpoint** — `GET /api/admin/sql?key=<ADMIN_KEY>&q=<SELECT...>` runs read-only SQL queries against the database.
- **Admin rebuild-prs endpoint** — `POST /api/admin/rebuild-prs` with `{"key": "<ADMIN_KEY>", "prs": [...]}` wipes and rebuilds the entire PRs table.

### 🔧 Works with Dan's help (just ask at session start)
- **Railway dashboard via Chrome** — ask Dan to have Railway open in browser, then use Chrome extension to view deploys, logs, env vars
- **Discord via Chrome** — ask Dan to have Discord open in browser for channel visibility

## REPOSITORIES (all under github.com/schultzdanielj-del)

### 1. ttm-dashboard (React/Vite frontend)
- **Deployed**: Railway at `https://dashboard-production-79f2.up.railway.app/{unique_code}`
- **Main file**: `src/App.tsx` (31KB) — fully wired to live API, no mock data
- **API client**: Direct fetch calls in App.tsx (the `src/api.ts` file exists but is UNUSED)
- **Stack**: React + TypeScript + Vite + Tailwind
- **Config**: `.env` has `VITE_API_URL`
- **Data files**: `data/` folder contains approved PR audit files (see Data Status below)

### 2. ttm-metrics-api (FastAPI backend)
- **Deployed**: Railway at `https://ttm-metrics-api-production.up.railway.app`
- **Version**: v1.5.6 — main.py (47KB) with all routes, repo synced with production
- **Database**: `database.py` — PostgreSQL on Railway, 10 SQLAlchemy models
- **Key endpoint**: `GET /api/dashboard/{unique_code}/full` returns everything in one call
- **Scraper**: `scrape_and_reload.py` — standalone script (can also be triggered via admin endpoint)
- **Admin endpoints**:
  - `GET /api/admin/config?key=<ADMIN_KEY>` — returns bot token + admin key from env vars
  - `GET /api/admin/sql?key=<ADMIN_KEY>&q=<SELECT...>` — read-only SQL queries
  - `GET /api/admin/rescrape?key=<ADMIN_KEY>` — wipes Discord-sourced PRs, re-scrapes channel (DEPRECATED — use rebuild-prs instead)
  - `POST /api/admin/rebuild-prs` — body: `{"key": "<ADMIN_KEY>", "prs": [...]}` — wipes entire PRs table, inserts provided records
  - `GET /api/admin/dump` — full database export
- **ADMIN_KEY**: `4ifQC_DLzlXM1c5PC6egwvf2p5GgbMR3`
- **Features working**: PR logging, fuzzy exercise matching (aggregates ALL name variants), workout plans, deload count tracking, core foods toggle, exercise swaps, user notes, 96h session tracking, XP/leveling, member management with unique codes
- **Debug endpoint**: `GET /api/debug/{unique_code}/exercise-names` — shows PR name groups and workout plan match results
- **Env vars on Railway**: DATABASE_URL, TTM_BOT_TOKEN, ADMIN_KEY

### 3. discord-bot
- **Main file**: `PRBot.py` (39KB) — confirmed in sync with deployed version
- **Supporting**: `exercise_normalization.py` (canonical normalization rules), `fuzzy_matching.py`
- **All commands use API** (PostgreSQL) — migrated from SQLite on Feb 13
- **XP/weekly logs/core foods** still use local SQLite (bot-specific, not shared)
- **Note**: Legacy `pr_tracker.db` SQLite still in repo (historical artifact, not used)

### 4. ttm-mcp-test — unused test repo, ignore

## DATABASE TABLES (PostgreSQL on Railway)
PRs, Workouts, WorkoutCompletions, DashboardMembers, CoreFoodsCheckins, UserNotes, ExerciseSwaps, WorkoutSessions, UserXP, WeeklyLogs

**Direct DB access**: Use DATABASE_PUBLIC_URL from Claude memory with psycopg2 in bash. Can run arbitrary SQL reads and writes.

## CURRENT DATA STATUS — PR DATABASE REBUILT AND VERIFIED ✅

### PR Table: 299 records, 99 unique exercises, 6 users — ALL NORMALIZED
| User | user_id | PRs | Source |
|------|---------|-----|--------|
| Dan (coach) | 718992882182258769 | 94 | Discord audit (Jan 11 – Feb 12) |
| Travis | 188471109363040256 | 76 | Discord audit (Jan 16 – Feb 12) |
| John | 607043556162666514 | 56 | Discord audit (Jan 5 – Feb 10) |
| Dan I (Zioz) | 103351819119398912 | 29 | Discord audit (Jan 24 – Feb 10) |
| Sonny | ND_sonny_a1b2c3d4e5f6 | 23 | API export, normalized |
| Feras | 919580721922859008 | 21 | API export, deduped (41→21), normalized |

### How the rebuild was done (session 6)
1. Parsed 4 Discord audit files from `ttm-dashboard/data/` (Dan, Travis, John, Zioz)
2. Exported Feras + Sonny data via `/api/admin/sql` endpoint
3. Feras had 20 duplicate PRs (same exercise/weight/reps/timestamp) — deduped to 21 unique
4. Applied normalization from `exercise_normalization.py` to ALL exercise names
5. Generated master dataset: 299 PRs, 99 unique exercises
6. POSTed to `/api/admin/rebuild-prs` endpoint — wiped 267 old records, inserted 299 normalized
7. Verified via SQL: counts match per user, all exercise names normalized

### Normalization applied
- DB→dumbbell, BB→barbell, BW→bodyweight
- Plurals→singular (curls→curl, rows→row, etc.)
- Abbreviations expanded (UH→underhand, OH→overhead, RDF→rear delt fly)
- skullcrushers→tricep extension, ab wheel→ab rollout
- Compound words normalized (chin up→chinup, pull up→pullup)
- Title Case→lowercase throughout

### Approved PR audit files (in `ttm-dashboard/data/`)
| File | User | PRs |
|------|------|-----|
| `data/dan_raw_vs_normalized.txt` | Dan | 94 |
| `data/warhound_raw_vs_normalized.txt` | Travis | 76 |
| `data/john_raw_vs_normalized.txt` | John | 56 |
| `data/zioz_raw_vs_normalized.txt` | Dan I | 29 |

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
- Clean PR data with 299 normalized records across 6 users
- Fuzzy exercise matching connecting workout plan names to PR data (e.g. "Head Supported RDF" → "head supported rear delt fly")
- Per-exercise logging with real-time PR detection (e1rm comparison)
- Core foods 7-day rolling calendar with tap/double-tap, 3-day edit window
- Exercise swap and revert with DB persistence
- User notes with auto-save on blur
- PR history graphs from real API data (aggregates across name variants)
- 96h session tracking (server-side)
- Cycle progress bar (stat panel 0)
- Dashboard member system with unique codes and URLs
- Admin rebuild-prs endpoint for complete DB reconstruction
- Admin SQL endpoint for ad-hoc queries

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
- Admin rebuild: `POST /api/admin/rebuild-prs` (body: `{"key": "...", "prs": [...]}`)
- Admin SQL: `GET /api/admin/sql?key=...&q=SELECT...`

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
3. Test bash curl to Railway API (check version)
4. Check if Chrome extension is connected
5. Ask Dan what to work on next
6. At END of conversation, update this file with what changed

## NEXT SESSION: PRIORITIES
1. Fix ATG split squat normalization in both exercise_normalization.py and scrape_and_reload.py
2. Resume feature work — deload cascade, UP NEXT/BEHIND badges, strength gains panel, or whatever Dan wants

## CHANGE LOG
- **Feb 14, 2026 (session 6)**: PR database rebuild complete. Added `/api/admin/sql` endpoint (v1.5.5) for read-only SQL queries. Added `/api/admin/rebuild-prs` endpoint (v1.5.6, new file `admin_rebuild.py`) for full PR table wipe+insert. Exported Feras (41 PRs, deduped to 21) and Sonny (23 PRs) via SQL endpoint. Parsed 4 Discord audit files. Applied normalization from exercise_normalization.py to all 299 PRs. POSTed master dataset to rebuild endpoint: 267 old → 299 normalized. Verified: 6 users, 99 unique exercises, all lowercase, no abbreviations. Data cleanup arc is COMPLETE.
- **Feb 14, 2026 (session 5, end)**: Railway API token created and stored in Claude memory. Added `backboard-v3.railway.app` to sandbox allowlist. Decided: Railway token in memory, bot token behind /api/admin/config endpoint. Updated access model — only one item remaining (config endpoint). Updated next session priorities. Cleaned up duplicate memory edits.
- **Feb 14, 2026 (session 5, start)**: Restored full main.py to API repo — recovered 42KB v1.4.0 from git history (commit a613c35), added admin_dump router, bumped to v1.5.3. All 36 routes now live and repo matches production. Added DATABASE_PUBLIC_URL to Claude memory. Added `shuttle.proxy.rlwy.net` to sandbox allowlist for direct PostgreSQL access. Confirmed discord-bot repo is in sync (PRBot.py 39KB, not a stub). Documented full Claude access model in PROJECT-STATUS.md.
- **Feb 14, 2026 (session 4)**: Completed Dan's PR audit (94 PRs from 155 messages). All 4 Discord users now approved. Pushed all audit files to `ttm-dashboard/data/` on GitHub. Added Railway domains to Claude sandbox allowlist (ttm-metrics-api-production.up.railway.app, dashboard-production-79f2.up.railway.app). Discovered main.py on GitHub (1.4KB) diverged from deployed version (~44KB with all routes) — DO NOT overwrite. Updated PROJECT-STATUS.md with audit file locations and next steps. Still need: export Feras+Sonny data, combine all 6 users, wipe+insert DB.
- **Feb 14, 2026 (session 3)**: Manual PR audit. Extracted raw Discord dump (314 messages). Built approved PR lists for Warhound (76 PRs), Zioz (29 PRs), John (56 PRs) via side-by-side RAW vs NORMALIZED review with Dan. Discovered scraper was missing ~70+ Warhound PRs (lbs x format), Dan's "for" format entries, all of John's reversed-format entries. Dan (coach) PR list still pending — next session. No DB changes made yet. Identified ATG split squat normalization bug.
- **Feb 14, 2026 (session 2)**: Data cleanup complete. Built admin rescrape endpoint (`GET /api/admin/rescrape?key=...`) so Dan doesn't need Railway CLI. Added `requests` to requirements.txt. Added `TTM_BOT_TOKEN` env var to API service. Rescrape wipes only Discord-sourced PRs, preserves Feras (41) + Sonny (23) manual PRs. Ran rescrape: 842 dirty PRs → 267 clean PRs (203 scraped + 64 preserved). 158 unique exercises → 119. Dashboard verified working with clean data. API bumped to v1.5.1.
- **Feb 14, 2026 (session 1)**: Investigated dirty PR data (842 records, 158 exercise names — mix of old un-normalized + scraper output). Root cause: scraper ran with --execute not --wipe. Synced normalization between bot and scraper (bot was using older incomplete rules). Removed TRX auto-append rules from both files. Bot `exercise_normalization.py` now has complete rules from the 100-question session. Next: run scraper with --wipe.
- **Feb 13, 2026 (earlier chat, not this project)**: Scraper built and run. Bot migrated from SQLite to API for all commands. 203 clean PRs loaded. But scraper used --execute not --wipe, leaving old data in place.
- **Feb 13, 2026 (session 2)**: API v1.4.0 — fixed PR history to aggregate across all exercise name variants via `_find_all_matching_names()`. Added debug endpoint. Identified data-only-spans-6-days issue (Feb 8-13).
