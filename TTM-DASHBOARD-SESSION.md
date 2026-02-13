# TTM Dashboard — Session Handoff (Feb 13, 2026)

## WHAT THIS IS
A React (JSX) fitness coaching dashboard for the Three Target Method. Currently a working mockup with hardcoded mock data, rendered as a Claude artifact. Tomorrow's goal: connect it to the live FastAPI + PostgreSQL backend and deploy for 5 real clients.

## REPO
- **GitHub**: `schultzdanielj-del/ttm-dashboard`
- **Main file**: `dashboard-mockup.jsx` (1,412 lines)
- **Spec**: `ttm-dashboard-spec.md`

## CURRENT STATE (WORKING)
The mockup renders in Claude's artifact renderer. All features below are tested and functional.

### Core Features
- **Core Foods**: 7-day rolling calendar, tap to check, double-tap to uncheck, 3-day edit window, streak counter, expanded servings view (4 protein + 3 veggie boxes)
- **Stats Panel**: 3 swipeable panels — Cycle Progress (%), Strength Gains (%), Cycle PRs (count + exercise tags)
- **Workouts A-E**: Collapsible accordion with UP NEXT / BEHIND / DELOAD badges
- **Exercise Display**: Best PR in green, hi/lo detection, warmup/feeler/work rows, PR history graph
- **Exercise Swap**: Click name → notes textarea + swap input. Normalizer maps shorthand to canonical names. Revert button.
- **User Notes**: Per-exercise textarea, persists per inputKey

### Logging System (added this session)
- **Log button**: Next to reps input, flashes green "Done" for 1.2s
- **Logged display**: Green weight/reps shown right of Log button
- **Unlimited re-logging**: Last log wins, updates best PR
- **Reps required**: Won't log if reps field is blank
- **Work weight pre-fill**: Best PR weight (NOT feeler) pre-filled in weight input
- **BW exercises**: Weight input with "BW" placeholder, editable for added weight (vest, belt)
- **Duplicate exercise handling**: inputKey includes idx (`A:ExName:0`, `A:ExName:1`) for unique identification

### PR System (added this session)
- **Exercise PR detection**: Compares e1rm (weight * (1 + reps/30)). BW exercises compare reps only.
- **Exercise PR visual**: "best" label becomes "PR" in same font size as the number (18px, bold 800). Both label and number turn yellow (#FFD60A). Stays until session expires.
- **Workout PR badge**: Shows "X% PR" on workout header. Color scales smoothly from yellow (low %) to orange to hot pink (100%). Font scales 9px to 18px. At 100% shows "FLAWLESS" instead of "100% PR".
- **Cycle PR panel**: Third swipeable stat panel showing total PR count + exercise name tags in yellow.
- **PR badge fade**: Workout % PR badge fades over 96 hours using rgba opacity calculation.

### Session System
- **96-hour session window**: Tracked per workout letter in `sessions` state
- **Session-aware display**: Logged results and PR visuals only show when `sessionActive` is true
- **Reset on new session**: If previous session expired (>96h), PR hits for that workout letter are cleared on next log
- **Best PR persists**: The actual best_pr number stays updated even after visuals reset

## CRITICAL IMPLEMENTATION DETAILS

### Keys and State
```
inputKey = `${letter}:${ex.name}:${idx}`   // Unique per exercise slot
exKey = `${letter}:${idx}`                  // Used for swaps and info panel
```

### State Variables
```javascript
const [data, setData] = useState(MOCK_DATA);     // Mutable - best PR updates on log
const [inputs, setInputs] = useState({});         // { "A:ExName:0": { weight: "85", reps: "12" } }
const [logged, setLogged] = useState({});          // { "A:ExName:0": { w: "85", r: "12", t: "3:42 PM", isPR: true } }
const [logFlash, setLogFlash] = useState({});      // { "A:ExName:0": true } - 1.2s green flash
const [userNotes, setUserNotes] = useState({});    // { "A:ExName:0": "Keep elbows tight" }
const [prHits, setPrHits] = useState({});          // { "A:ExName:0": true } - PR was hit this session
const [prFlash, setPrFlash] = useState({});        // { "A:ExName:0": true } - 2s flash on PR
const [sessions, setSessions] = useState({});      // { "A": { openedAt: Date, logCount: 3 } }
```

### Warmup/Feeler Calculations (live, not from mock data)
- Warmup weight: `Math.round(bestWeight * 0.5 / 5) * 5`
- Feeler weight: `Math.round(bestWeight * 0.75 / 5) * 5`
- BW warmup reps: `Math.round(bestReps * 0.4)`
- BW feeler reps: `Math.round(bestReps * 0.3)`

### PR Detection Logic
```javascript
const oldE1rm = bestW * (1 + bestR / 30);
const newE1rm = numW * (1 + numR / 30);
const isPR = isBW ? numR > bestR : newE1rm > oldE1rm;
```

### Font URL
The artifact renderer chokes on `&` in Google Fonts URL. Use `?family=Roboto:wght@400;500;600;700` without the JetBrains Mono import.

### Things That Break the Artifact Renderer
- Emoji via `\u{1F3C6}` unicode escapes - use literal emoji or ASCII
- Orphaned JSX elements inside `{condition && (...)}` without fragments
- Variables declared in IIFE `{(() => { const x = ... })()}` used outside that IIFE
- Python f-strings replacing JSX with `{` braces - use `c.replace()` not f-strings
- The `&` character in font URLs
- Adding new JSX sibling elements inside `{!isDeloadMode && (...)}` without a fragment wrapper

## TOMORROW'S TASK: CONNECT TO LIVE API

### What Needs to Change
1. **Replace MOCK_DATA** with API fetch on mount using user ID from URL param
2. **Replace exerciseDB** with API endpoint that returns user's exercise catalog
3. **Replace normalizeExercise()** with API call to fuzzy matcher
4. **handleLog** needs to POST to API instead of local state update
5. **User notes** need GET/POST to persist in database
6. **Swaps** need to persist via API (currently local state only)
7. **Core foods check-ins** need GET/POST to persist
8. **Each client gets their own URL**: e.g., `dashboard.ttm.app?user=abc123`

### Existing Infrastructure
- **API**: FastAPI on Railway
- **Database**: PostgreSQL on Railway
- **Bot**: Discord bot with PR tracking, XP system, core foods check-ins
- **GitHub**: `schultzdanielj-del/ttm-dashboard` (this repo) + bot repo

### API Endpoints Needed
```
GET  /api/dashboard/{user_id}     -> Full dashboard data (workouts, PRs, deload, core foods, etc.)
POST /api/log                     -> { user_id, exercise, weight, reps, workout_letter }
POST /api/swap                    -> { user_id, workout_letter, idx, new_exercise }
POST /api/notes                   -> { user_id, exercise, note }
POST /api/core-foods              -> { user_id, date, checked }
GET  /api/exercises/{user_id}     -> User's exercise catalog with PRs
POST /api/normalize               -> { query } -> { canonical_name }
```

### 5 Clients to Set Up
Each client needs:
- Their workout plan (A-E exercises) entered in the database
- Historical PRs migrated (110+ PRs already in PostgreSQL from Discord bot)
- Unique dashboard URL
- Core foods history

## DESIGN SPEC SUMMARY
- Dark theme: #000 bg, #0A0A0A cards, #1C1C1E borders
- Green #34C759: success, PRs, UP NEXT
- Orange #FF9500: warnings, BEHIND, new exercises
- Yellow #FFD60A: deload, PR indicators
- Red #FF3B30: too heavy, negative gains
- Hot pink (dynamic): high % PR on workout headers
- Fonts: Roboto (UI), JetBrains Mono (numbers)
- Mobile-first: 430px max width

## KNOWN ISSUES / TODO
1. **Normalizer is hardcoded** - needs API integration for fuzzy matching against user's program
2. **Graph data is mock** - needs real PR history from database
3. **Strength gains are mock** - needs real cycle-over-cycle comparison
4. **Deload cascade is mock** - needs real completion tracking
5. **No authentication** - URL-based user ID only (fine for Discord community)
6. **Session tracking is client-side** - should be server-side for persistence across devices