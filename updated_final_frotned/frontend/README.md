# BhoomiSetu — Frontend Application

Predictive Land Acquisition Delay Intelligence Platform for Gujarat state and district authorities.

## Architecture

- `src/`
  - `components/` — Operational intelligence dashboard views (Corridor GIS, State Benchmarking, Fund Tracking, Project 360, Intelligence Modules) and Error Boundary
  - `components/ui/` — 55+ accessible shadcn/ui & Radix UI primitives
  - `lib/` — Mock dataset (`mockData.ts`) and styling utilities (`utils.ts`)
  - `hooks/` — Custom hooks (`use-mobile.tsx`, `use-toast.ts`)
  - `styles/` — Global styling and Tailwind CSS v4 setup (`index.css`)
  - `pages/` — Route fallback pages (`not-found.tsx`)
  - `App.tsx` — Root application shell, navigation chrome, state management, and tab views
  - `main.tsx` — DOM root entrypoint
- `public/` — Static assets, icons, and benchmarking reference imagery

## Development

```bash
# Start Vite development server
pnpm dev
# or from workspace root:
pnpm --filter @workspace/frontend dev

# Build for production
pnpm build

# Typecheck
pnpm typecheck
```
