# TTM Dashboard

Web-based dashboard for Three Target Method fitness coaching. Provides personalized workout tracking with PR history, deload counter, and core foods logging.

## Features

- ✅ Unique access code authentication (one code per user)
- ✅ Personalized workout program display
- ✅ Best PR display for each exercise
- ✅ Deload counter (0/6 to 6/6 tracking)
- ✅ Workout logging with automatic PR detection
- ✅ Core foods daily check-in
- ✅ Mobile-first responsive design
- ✅ Dark theme (#1a1a1a background, compact spacing)

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- FastAPI backend (Railway)
- PostgreSQL database

## Development

```bash
npm install
npm run dev
```

Dashboard will be at: http://localhost:5173

## API Integration

Dashboard connects to: `https://ttm-metrics-api-production.up.railway.app`

**Endpoints used:**
- `GET /api/dashboard/{code}/workouts` - Load workout program
- `GET /api/dashboard/{code}/best-prs` - Load best PRs
- `GET /api/dashboard/{code}/deload-status` - Load completion counts
- `POST /api/dashboard/{code}/log-workout` - Submit workout
- `GET /api/dashboard/{code}/core-foods` - Load core foods history

See `src/api.ts` for implementation.

## Deployment

**Live Dashboard**: https://dashboard-production-79f2.up.railway.app

Deployed to Railway with environment variable:
```
VITE_API_URL=https://ttm-metrics-api-production.up.railway.app
```

## Creating Users

Users need a unique access code. On the API side:

```bash
# 1. Create dashboard member
python create_dashboard_user.py <user_id> <username>

# 2. Add workout plan
python add_workout_plan.py <user_id>
```

Share the dashboard URL and access code with the user.

## Design Specs

- Background: #1a1a1a (dark)
- Text: #e0e0e0 (light gray)
- Font: Roboto, sans-serif
- Spacing: Compact (6px margins, 8px padding)
- Mobile-first responsive design

## User Flow

1. Enter unique access code
2. View personalized workout program
3. Expand workout to log exercises
4. Enter weight/reps, check core foods
5. Submit workout
6. See updated deload counter and PRs

