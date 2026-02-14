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
- **API repo structure changed (session 9)** — main.py was split into 3 files due to GitHub MCP tool size limits (~25KB max per file push). See API section below.
- **Discord bot repo in sync** — PRBot.py is 39KB, full code, confirmed matching deployed version.
- **API access via curl** — can hit all endpoints from bash container
- **Dashboard access via curl** — can fetch frontend from bash container
- **Direct PostgreSQL access** — DATABASE_PUBLIC_URL is stored in Claude memory. Domain `shuttle.proxy.rlwy.net` is on the allowlist. Works from bash with psycopg2.
- **Railway API token** — stored in Claude memory. Domain `backboard-v3.railway.app` is on the allowlist. Use for GraphQL API to check deploys, restart services, read logs.
- **Admin config endpoint** — `GET /api/admin/config?key=<ADMIN_KEY>` returns bot token and admin key from env vars.
- **Admin SQL endpoint** — `GET /api/admin/sql?key=<ADMIN_KEY>&q=<SELECT...>` runs read-only SQL queries against the database.
- **Admin rebuild-prs endpoint** — `POST /api/admin/rebuild-prs` with `{"key": "<ADMIN_KEY>", "prs": [...]}` wipes and rebuilds the entire PRs table.
- **Admin bulk-core-foods endpoint** — `POST /api/admin/bulk-core-foods` with `{"key": "<ADMIN_KEY>", "records": [...]}` bulk inserts core foods check-ins (bypasses date validation).

### 🔧 Works with Dan's help (just ask at session start)
- **Railway dashboard via Chrome** — ask Dan to have Railway open in browser, then use Chrome extension to view deploys, logs, env vars
- **Discord via Chrome** — ask Dan to have Discord open in browser for channel visibility

### ⚠️ GitHub MCP file size limitation
- `push_files` and `create_or_update_file` silently truncate content over ~25KB
- Workaround: split large files into multiple modules, each under 25KB
- This is why main.py was refactored into 3 files in session 9

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
- **Version**: v1.5.7
- **File structure (refactored session 9)**:
  - `main.py` (~1KB) — entry point, creates FastAPI app, includes all routers
  - `main_routes.py` (~18KB) — helper functions, exercise matching, PR endpoints, workout endpoints, XP endpoints, member endpoints
  - `main_routes_p2.py` (~19KB) — dashboard data endpoints, notes, swaps, sessions, `/full`, weekly logs, core foods, debug, admin SQL, admin rescrape
  - `admin_dump.py` — full database export endpoint
  - `admin_rebuild.py` — PR table wipe+insert endpoint
  - `admin_core_foods.py` — bulk core foods insert endpoint (new session 9)
- **Database**: `database.py` — PostgreSQL on Railway, 10 SQLAlchemy models
- **Key endpoint**: `GET /api/dashboard/{unique_code}/full` returns everything in one call
- **Scraper**: `scrape_and_reload.py` — standalone script (can also be triggered via admin endpoint)
- **Admin endpoints**:
  - `GET /api/admin/config?key=<ADMIN_KEY>` — returns bot token + admin key from env vars
  - `GET /api/admin/sql?key=<ADMIN_KEY>&q=<SELECT...>` — read-only SQL queries
  - `GET /api/admin/rescrape?key=<ADMIN_KEY>` — wipes Discord-sourced PRs, re-scrapes channel (DEPRECATED — use rebuild-prs instead)
  - `POST /api/admin/rebuild-prs` — body: `{"key": "<ADMIN_KEY>", "prs": [...]}` — wipes entire PRs table, inserts provided records
  - `POST /api/admin/bulk-core-foods` — body: `{"key": "<ADMIN_KEY>", "records": [...]}` — bulk inserts core foods (bypasses 2-day date validation, skips duplicates)
  - `GET /api/admin/dump` — full database export
- **ADMIN_KEY**: `4ifQC_DLzlXM1c5PC6egwvf2p5GgbMR3`
- **Features working**: PR logging, fuzzy exercise matching (aggregates ALL name variants), workout plans, deload count tracking, core foods toggle, exercise swaps, user notes, 96h session tracking, XP/leveling, member management with unique codes
- **Debug endpoint**: `GET /api/debug/{unique_code}/exercise-names` — shows PR name groups and workout plan match results
- **Env vars on Railway**: DATABASE_URL, TTM_BOT_TOKEN, ADMIN_KEY

### 3. discord-bot
- **Main file**: `PRBot.py` (39KB) — confirmed in sync with deployed version
- **Supporting**: `exercise_normalization.py` (canonical normalization rules), `fuzzy_matching.py`
- **All PR commands use API** (PostgreSQL) — migrated from SQLite on Feb 13
- **Core foods check-ins still write to local SQLite** — needs migration to API (next step)
- **XP/weekly logs** also still use local SQLite
- **Bot command**: `!dump_core_foods` — exports all core foods from SQLite as JSON (used for migration)

### 4. ttm-mcp-test — unused test repo, ignore

## DATABASE TABLES (PostgreSQL on Railway)
PRs, Workouts, WorkoutCompletions, DashboardMembers, CoreFoodsCheckins, UserNotes, ExerciseSwaps, WorkoutSessions, UserXP, WeeklyLogs

**Direct DB access**: Use DATABASE_PUBLIC_URL from Claude memory with psycopg2 in bash. Can run arbitrary SQL reads and writes.

## CURRENT DATA STATUS

### PR Table: 299 records, 99 unique exercises, 6 users — ALL NORMALIZED ✅
| User | user_id | PRs | Source |
|------|---------|-----|--------|
| Dan (coach) | 718992882182258769 | 94 | Discord audit (Jan 11 – Feb 12) |
| Travis | 188471109363040256 | 76 | Discord audit (Jan 16 – Feb 12) |
| John | 607043556162666514 | 56 | Discord audit (Jan 5 – Feb 10) |
| Dan I (Zioz) | 103351819119398912 | 29 | Discord audit (Jan 24 – Feb 10) |
| Sonny | ND_sonny_a1b2c3d4e5f6 | 23 | API export, normalized |
| Feras | 919580721922859008 | 21 | API export, deduped (41→21), normalized |

### Core Foods Table: 60 records, 5 users — MIGRATED ✅ (session 9)
| User | user_id | Check-ins | Date Range |
|------|---------|-----------|------------|
| Dan (coach) | 718992882182258769 | 21 | Jan 15 – Feb 13 |
| Dan I (Zioz) | 103351819119398912 | 21 | Jan 17 – Feb 13 |
| John | 607043556162666514 | 9 | Jan 23 – Feb 1 |
| Travis (Ben) | 188471109363040256 | 8 | Feb 4 – Feb 11 |
| Andrew | 780219213389234196 | 1 | Feb 12 |

**Migration method**: Extracted from bot's SQLite via `!dump_core_foods` command, bulk inserted via `/api/admin/bulk-core-foods` endpoint.

**⚠️ Bot still writes new core foods to SQLite.** Next step: update bot to POST to API instead.

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
- Core foods data migrated — 60 historical check-ins across 5 users
- Fuzzy exercise matching connecting workout plan names to PR data
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
- Admin bulk-core-foods endpoint for historical data migration

## WHAT'S NOT DONE YET
1. **Bot core foods → API migration** — Bot still writes new check-ins to SQLite. Need to update bot to POST to API so all future data goes to PostgreSQL.
2. **Deload cascade** — API just increments completion count and resets on 7-day gap. Missing: first-to-6 triggers cascade, others get 1 more session, 10-day max auto-deload, 7-day inactivity auto-reset
3. **UP NEXT / BEHIND badges** — Frontend hardcodes `workouts[0]` as UP NEXT. No real rotation tracking server-side.
4. **Strength gains panel** — Shows "--" placeholder. Needs cycle-over-cycle e1rm comparison
5. **Hi/Lo PR detection** — Spec describes it but not implemented
6. **Workout completion increment** — Logging individual exercises works, but nothing increments the deload completion count from the dashboard.
7. **"Too heavy" for timed exercises** — Threshold is 60s per spec, partially implemented in frontend

## CRITICAL URLS
- Dashboard (Dan's): `https://dashboard-production-79f2.up.railway.app/UUtTjHrS4WP6uQzqd0uPcA`
- API root: `https://ttm-metrics-api-production.up.railway.app/`
- API docs: `https://ttm-metrics-api-production.up.railway.app/docs`
- Members list: `GET /api/dashboard/members`
- Admin rebuild: `POST /api/admin/rebuild-prs` (body: `{"key": "...", "prs": [...]}`)
- Admin SQL: `GET /api/admin/sql?key=...&q=SELECT...`
- Admin bulk core foods: `POST /api/admin/bulk-core-foods` (body: `{"key": "...", "records": [...]}`)

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
1. **Update bot to write core foods to API** — so new check-ins go to PostgreSQL instead of SQLite
2. Fix ATG split squat normalization in both exercise_normalization.py and scrape_and_reload.py
3. Resume feature work — deload cascade, UP NEXT/BEHIND badges, strength gains panel, or whatever Dan wants

## CHANGE LOG
- **Feb 14, 2026 (session 9)**: Core foods migration from bot SQLite to PostgreSQL. Created `admin_core_foods.py` with bulk insert endpoint (bypasses 2-day date validation). Extracted 60 check-ins via `!dump_core_foods` bot command. Bulk inserted to PostgreSQL: Dan 21, Zioz 21, John 9, Ben 8, Andrew 1. Accidentally truncated main.py during router wiring — discovered GitHub MCP tools silently truncate files >25KB. Refactored API into 3 files: `main.py` (1KB entry point), `main_routes.py` (18KB core routes), `main_routes_p2.py` (19KB dashboard/admin routes). API v1.5.7 deployed and verified healthy. Bot still writes new core foods to SQLite — next step is migrating bot to use API.
- **Feb 14, 2026 (session 8)**: Deployed `!dump_core_foods` command to bot for data extraction. Commit 016665912ca465750d83a1cc4c1cdb575e204a22.
- **Feb 14, 2026 (session 6)**: PR database rebuild complete. Added `/api/admin/sql` endpoint (v1.5.5) for read-only SQL queries. Added `/api/admin/rebuild-prs` endpoint (v1.5.6, new file `admin_rebuild.py`) for full PR table wipe+insert. Exported Feras (41 PRs, deduped to 21) and Sonny (23 PRs) via SQL endpoint. Parsed 4 Discord audit files. Applied normalization from exercise_normalization.py to all 299 PRs. POSTed master dataset to rebuild endpoint: 267 old → 299 normalized. Verified: 6 users, 99 unique exercises, all lowercase, no abbreviations. Data cleanup arc is COMPLETE.
- **Feb 14, 2026 (session 5, end)**: Railway API token created and stored in Claude memory. Added `backboard-v3.railway.app` to sandbox allowlist. Decided: Railway token in memory, bot token behind /api/admin/config endpoint. Updated access model — only one item remaining (config endpoint). Updated next session priorities. Cleaned up duplicate memory edits.
- **Feb 14, 2026 (session 5, start)**: Restored full main.py to API repo — recovered 42KB v1.4.0 from git history (commit a613c35), added admin_dump router, bumped to v1.5.3. All 36 routes now live and repo matches production. Added DATABASE_PUBLIC_URL to Claude memory. Added `shuttle.proxy.rlwy.net` to sandbox allowlist for direct PostgreSQL access. Confirmed discord-bot repo is in sync (PRBot.py 39KB, not a stub). Documented full Claude access model in PROJECT-STATUS.md.
- **Feb 14, 2026 (session 4)**: Completed Dan's PR audit (94 PRs from 155 messages). All 4 Discord users now approved. Pushed all audit files to `ttm-dashboard/data/` on GitHub. Added Railway domains to Claude sandbox allowlist (ttm-metrics-api-production.up.railway.app, dashboard-production-79f2.up.railway.app). Discovered main.py on GitHub (1.4KB) diverged from deployed version (~44KB with all routes) — DO NOT overwrite. Updated PROJECT-STATUS.md with audit file locations and next steps. Still need: export Feras+Sonny data, combine all 6 users, wipe+insert DB.
- **Feb 14, 2026 (session 3)**: Manual PR audit. Extracted raw Discord dump (314 messages). Built approved PR lists for Warhound (76 PRs), Zioz (29 PRs), John (56 PRs) via side-by-side RAW vs NORMALIZED review with Dan. Discovered scraper was missing ~70+ Warhound PRs (lbs x format), Dan's "for" format entries, all of John's reversed-format entries. Dan (coach) PR list still pending — next session. No DB changes made yet. Identified ATG split squat normalization bug.
- **Feb 14, 2026 (session 2)**: Data cleanup complete. Built admin rescrape endpoint (`GET /api/admin/rescrape?key=...`) so Dan doesn't need Railway CLI. Added `requests` to requirements.txt. Added `TTM_BOT_TOKEN` env var to API service. Rescrape wipes only Discord-sourced PRs, preserves Feras (41) + Sonny (23) manual PRs. Ran rescrape: 842 dirty PRs → 267 clean PRs (203 scraped + 64 preserved). 158 unique exercises → 119. Dashboard verified working with clean data. API bumped to v1.5.1.
- **Feb 14, 2026 (session 1)**: Investigated dirty PR data (842 records, 158 exercise names — mix of old un-normalized + scraper output). Root cause: scraper ran with --execute not --wipe. Synced normalization between bot and scraper (bot was using older incomplete rules). Removed TRX auto-append rules from both files. Bot `exercise_normalization.py` now has complete rules from the 100-question session. Next: run scraper with --wipe.
- **Feb 13, 2026 (earlier chat, not this project)**: Scraper built and run. Bot migrated from SQLite to API for all commands. 203 clean PRs loaded. But scraper used --execute not --wipe, leaving old data in place.
- **Feb 13, 2026 (session 2)**: API v1.4.0 — fixed PR history to aggregate across all exercise name variants via `_find_all_matching_names()`. Added debug endpoint. Identified data-only-spans-6-days issue (Feb 8-13).
