# BhoomiSetu — Predictive Land Acquisition Delay Intelligence Platform

_Predictive land acquisition delay intelligence platform for Gujarat state and district authorities._

## Run & Operate

- `pnpm dev` — run the BhoomiSetu frontend dev server (port 5173)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18, Vite 7, Tailwind CSS, shadcn/ui, Radix UI, TanStack Query, Lucide icons
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

### Frontend (`artifacts/bhoomi-setu/src/`)
- `app/` — Application shell, root routing, and top-level providers
- `pages/` — Screen and route view components (`not-found.tsx`, etc.)
- `components/` — Shared React components and UI primitives (`components/ui/` for shadcn/Radix primitives, `error-boundary.tsx`)
- `hooks/` — Custom React hooks (`use-mobile.tsx`, `use-toast.ts`)
- `lib/` — Shared utilities, services, and helpers (`utils.ts`, `mockData.ts`)
- `types/` — Shared TypeScript types and interfaces
- `context/` — React context providers
- `assets/` — Images, icons, and static assets
- `styles/` — Global stylesheet and Tailwind CSS entry (`styles/index.css`)
- `main.tsx` — Application entrypoint and DOM root render

## Architecture decisions

- Design System: **Ocean Teal — Clean Government Intelligence**. Institutional, data-driven GovTech aesthetic with Deep Teal (`#064C55`) navigation chrome, Dark Teal (`#063F49`) secondary navigation, Ocean Teal (`#0FA89A`) primary brand/action color, Emerald (`#16A878`) for positive/completed states, Primary Navy (`#102A43`) typography, Secondary Slate (`#526B82`), subtle `#EDF6F5` section backgrounds, `#F5FAF9` canvas, and white cards with `#D8E8E6` borders.
- Standardized status semantics across all 8 modules: Success (`#19A974`), Warning (`#F2A51A`), Danger (`#E85D68`), Info (`#5BA7D9`).

## Product

- Command Center: State-level land acquisition monitoring and leading risk indicators.
- National Corridor Map: Route-based geographic risk analysis with critical/high/moderate/low corridor status.
- District Diagnostics: Comparative district-level risk rankings, trends, and exposure.
- Early Warning Center: Machine learning predictive alerts with evidence explainability and action assignment.
- Fund Tracking: Compensation ledgers, aging analysis (>90 days), and district fund position.
- Projects 360: Deep lifecycle drill-down with stage blockers and risk factor contributions.
- Intelligence Modules: Analytical explainability connecting leading signals to field decisions.
- State Benchmarking: Normalised peer state/district performance benchmarking.

## User preferences

- Theme: **Ocean Teal — Clean Government Intelligence** consistently applied to all screens. No purple-heavy UI, no neon, no flashy fintech gradients or glassmorphism. Light dashboard canvas with deep teal navigation and strong navy typography.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
