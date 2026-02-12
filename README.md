# Three Target Method Dashboard

Mobile-first dashboard for TTM Discord coaching clients.

## Features

- **Deload Progress Tracking** - Visual progress bar showing workout completion
- **Workout Management** - Collapsible workouts with PR display
- **Warmup/Feeler Calculations** - Automatic weight calculations (50% warmup, 75% feeler)
- **Core Foods Tracking** - 7-day check-in history with protein/veggie compliance
- **PR Logging** - Simple weight/reps input with Log button

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Roboto font

## Design Specs

- Dark theme: #000 background, #FFF text
- Mobile-first responsive design
- Click exercise name to view progress graphs (TODO)
- Core foods: max 2 days back-logging allowed

## Development

```bash
npm install
npm run dev
```

## Deployment

Deploy to Vercel or Railway. Set up API integration with TTM FastAPI backend.

## API Integration (TODO)

Connect to `ttm-metrics-api-production.up.railway.app` for:
- GET /api/workouts/{user_id}
- GET /api/prs/{user_id}/latest
- POST /api/prs
- GET /api/core-foods/{user_id}/weekly
- POST /api/core-foods
