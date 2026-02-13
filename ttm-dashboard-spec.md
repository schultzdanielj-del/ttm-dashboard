# TTM Dashboard — Full Spec (as of Feb 13, 2026)

## File Location
- Working file: dashboard-mockup.jsx (1,412 lines)
- Session doc: TTM-DASHBOARD-SESSION.md

## Layout (top to bottom)
1. **Header**: "[Name]'s Program"
2. **Core Foods**: 7-day rolling calendar, single tap check / double tap uncheck, 3-day edit window (today + 2 days back), streak counter, double-tap label for expanded view (4 protein blue + 3 veggie green boxes)
3. **Stats Panel**: 3 swipeable panels with dot indicators. Panel 0 = cycle %. Panel 1 = avg % strength gain. Panel 2 = cycle PR count + exercise tags.
4. **Workouts A-E**: Collapsible accordion sections with UP NEXT / BEHIND / DELOAD / X% PR badges
5. **Footer**: "THREE TARGET METHOD" + Discord icon

## Exercise Display
- Click exercise name -> info panel (coach notes + user notes textarea + swap field)
- Click "best" / "PR" -> PR history line graph
- **Best PR**: green, format "85/12". BW exercises show "BW/12". Timed exercises show "BW/60s"
- **PR state**: When PR hit, "best" becomes "PR" (same font size as number, 18px bold 800), both turn yellow #FFD60A. Resets when 96h session expires.
- **Hi/Lo detection**: When 5lb increment > 15% of weight, shows two PRs: "best 30/12" and "or 25/18"
- **Warmup/Feeler (weighted)**: Warmup = Math.round(bestWeight * 0.5 / 5) * 5 x 10-20 reps, Feeler = Math.round(bestWeight * 0.75 / 5) * 5 x 5-8 reps
- **Warmup/Feeler (BW)**: Warmup = BW x Math.round(bestReps * 0.4) or easier variation x 10-20, Feeler = BW x Math.round(bestReps * 0.3)
- **Work row**: [weight input] x [reps input] [Log button] [logged w/r in green]
- **Work weight pre-fill**: Best PR weight (not feeler)
- **BW weight input**: Editable with "BW" placeholder, for added weight (vest/belt)
- **"Probably too heavy"**: Red text if work weight > best weight AND best reps < 17 (or < 60s for timed)
- **New exercises** (no history): Shows "new" in orange. Warmup = very light x 10-20, Feeler = medium/easy x 5-8, Work = inputs with "10-25 reps" hint
- **Duplicate exercises**: Same exercise appearing twice uses idx in inputKey for unique identification

## Logging
- Log button flashes green "Done" for 1.2s
- Logged weight/reps shown in green right of button
- Reps required (won't log if blank)
- Unlimited re-logging, last log wins, updates best PR
- PR detection: e1rm comparison (weight * (1 + reps/30)). BW = reps only.

## PR System
- **Exercise PR**: "best" -> "PR" label, yellow, bigger font. Resets after 96h session.
- **Workout PR**: "X% PR" badge on header. Color: yellow -> orange -> hot pink (100%). Size: 9px -> 18px. 100% = "FLAWLESS". Fades over 96 hours.
- **Cycle PRs**: 3rd swipeable panel. Shows count + exercise name tags.

## Session System
- 96-hour window from first log per workout letter
- PR visuals and logged display only show when session active
- PR hits cleared when new session starts after expiry
- Workout PR badge fades linearly over 96 hours

## Exercise Swap
- Click exercise name -> panel with coach notes + user notes + "Swap to..." input
- Normalizer converts shorthand to canonical names (needs API in prod)
- Swapped exercise pulls real PR/warmup/feeler from exerciseDB
- Shows "prescribed: [original]" underneath
- "Revert to prescribed" button (orange)

## User Notes
- Textarea per exercise in info panel, above swap input
- Persists per exercise across cycles (keyed by inputKey)
- In prod: stored in database per user per exercise

## Rotation & Scheduling
- Sequential: A->B->C->D->E->A...
- UP NEXT badge (green border, full opacity)
- Other workouts dimmed 50%
- 5-day same-workout lockout
- 3-consecutive-day rest nudge
- N-1 frequency (5 workouts = train 4x/week)
- BEHIND badge (orange, 70% opacity) with 3-day catchup

## Cycle & Deload
- 6 work rounds + deload = full cycle
- First workout hitting 6 triggers deload cascade
- Others get 1 more session then forced deload
- 10-day max before auto-deload
- Deload mode: feelers only, no work/log, 7 days
- 7-day inactivity = auto-reset

## Visual Design
- #000 bg, #0A0A0A cards, #1C1C1E borders
- #34C759 green: success, PRs, UP NEXT
- #FF9500 orange: warnings, BEHIND, new
- #FFD60A yellow: deload, PR indicators
- #FF3B30 red: too heavy, negative gains
- Hot pink (dynamic rgb): high % workout PR
- Fonts: Roboto (UI), JetBrains Mono (numbers)
- Mobile-first: 430px max width
- Discord #5865F2 purple icon in footer

## Mock Data Shape
```
{
  username, deload: {A:N,...}, workouts: {A:[{name, best_pr, warmup, feeler, lo_pr?, special?, notes?, isSecondSet?}]},
  coreFoods: {checkedDates: {"YYYY-MM-DD": true}}, cycleGains: {A:[%,...]},
  deloadMode: {A:bool,...}, lastWorkoutDate, upNext: "E", behind: {C:true}
}
```