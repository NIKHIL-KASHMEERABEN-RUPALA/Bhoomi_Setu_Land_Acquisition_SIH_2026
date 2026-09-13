# BhoomiSetu Frontend — Complete Architecture, Reference & Error Recovery Guide

This master guide provides complete technical reference and recovery procedures for the BhoomiSetu Frontend. If you encounter any build error, runtime issue, styling problem, or port conflict, follow the solutions below.

---

## Table of Contents
1. [Emergency 1-Step Recovery](#1-emergency-1-step-recovery)
2. [Frontend Architecture & File Map](#2-frontend-architecture--file-map)
3. [All Views & Route Breakdown in App.tsx](#3-all-views--route-breakdown-in-apptsx)
4. [Master Error Catalog & Instant Solutions](#4-master-error-catalog--instant-solutions)
5. [Standalone Execution (Zero-Monorepo Mode)](#5-standalone-execution-zero-monorepo-mode)
6. [Testing & Verification Commands](#6-testing--verification-commands)

---

## 1. Emergency 1-Step Recovery

If any file edit breaks your application, two complete backups are ready:

### To Restore `App.tsx` from Backup:
```powershell
# Restore App.tsx in frontend:
Copy-Item "frontend\src\App.backup.tsx" "frontend\src\App.tsx" -Force

# Or in artifacts/bhoomi-setu:
Copy-Item "artifacts\bhoomi-setu\src\App.backup.tsx" "artifacts\bhoomi-setu\src\App.tsx" -Force
```

### To Restore the Entire `frontend/` Folder:
```powershell
# Restore full frontend directory from frontend_backup:
Copy-Item -Path "frontend_backup\*" -Destination "frontend" -Recurse -Force
```

---

## 2. Frontend Architecture & File Map

```
frontend/
├── index.html                               # HTML entry point (title, fonts, mounting div #root)
├── package.json                             # Workspace package configuration with catalog dependencies
├── package.standalone.json                  # Standalone package.json for standard npm outside monorepo
├── tsconfig.json                            # TypeScript configuration with @/* path aliases
├── vite.config.ts                           # Vite configuration with React, Tailwind v4, & path aliases
├── components.json                          # shadcn/ui component configuration
├── .gitignore                               # Excludes node_modules, dist, .tsbuildinfo
├── README.md                                # High-level summary & quickstart
├── public/                                  # Static files served directly by Vite
│   ├── favicon.svg                          # Site favicon
│   ├── robots.txt                           # Search engine crawling rules
│   └── assets/                              # Benchmarking card imagery
│       ├── bench_card_cadastral.png
│       ├── bench_card_dbt.png
│       └── bench_card_row.png
└── src/
    ├── main.tsx                             # Application DOM entry (Mounts App inside TanStack Query & Toaster)
    ├── App.tsx                              # Master Application Shell, Navigation Chrome & View Router
    ├── App.backup.tsx                       # Clean, verified backup of App.tsx
    ├── components/                          # Core intelligence dashboard views
    │   ├── corridor-gis-view.tsx            # National Corridor Risk Map & GIS Analysis
    │   ├── fund-tracking-view.tsx           # Compensation ledgers, aging analysis, & fund positions
    │   ├── intelligence-modules-view.tsx    # ML explainability connecting signals to field decisions
    │   ├── project-360-view.tsx             # Deep lifecycle drilldown with stage blockers & risk factors
    │   ├── state-benchmarking-view.tsx      # Peer state and district performance benchmarking
    │   ├── error-boundary.tsx               # Catch-all React error boundary with retry UI
    │   └── ui/                              # 55+ accessible shadcn/ui & Radix UI primitives
    ├── hooks/
    │   ├── use-mobile.tsx                   # Window resize detector for responsive layouts
    │   └── use-toast.ts                     # Toast state dispatch and subscription
    ├── lib/
    │   ├── mockData.ts                      # Gujarat district, corridor, project, and benchmark dataset
    │   └── utils.ts                         # clsx + tailwind-merge helper function (`cn`)
    ├── pages/
    │   └── not-found.tsx                    # 404 Not Found fallback view
    └── styles/
        └── index.css                        # Ocean Teal design tokens, CSS variables, & Tailwind CSS v4
```

---

## 3. All Views & Route Breakdown in App.tsx

`App.tsx` serves as the institutional dashboard application shell:

| Route Path | View Component / Section | Purpose |
|------------|--------------------------|---------|
| `/` | `CommandCenterView` | High-level KPIs, Statewide Risk Concentration Map, Urgent Alerts, Critical Projects table |
| `/corridor-map` | `<CorridorGisView />` | Geographic corridor visualization (Vadodara-Mumbai, Dholera SIR, etc.), risk overlays |
| `/district-diagnostics` | `DistrictDiagnosticsView` | District-by-district delay scores, pending compensation, pipeline projects |
| `/early-warning` | `EarlyWarningView` | ML predictive warnings, risk categories, assignable mitigation workflows |
| `/fund-tracking` | `<FundTrackingView />` | Budget allocation, aging ledgers (>90 days), district escrow balances |
| `/project/:id` | `<Project360View />` | 360-degree timeline drilldown for specific projects (e.g. `p-004`) |
| `/intelligence` | `<IntelligenceModulesView />` | Deep dive into legal, valuation, dispute, and environmental delay drivers |
| `/state-benchmarking` | `<StateBenchmarkingView />` | Gujarat performance compared against peer states (Maharashtra, Karnataka, etc.) |
| `/policy-briefing` | `PolicyBriefingView` | Generated institutional briefs for decision makers |
| `/settings` | `SettingsView` | Roles, permissions, data sync configurations |
| `/audit-log` | `AuditLogView` | Immutable log of administrative decisions and status changes |

---

## 4. Master Error Catalog & Instant Solutions

### Error 1: Port Conflict (`EADDRINUSE: port 5173`)
**Symptom:** Terminal says `Port 5173 is in use, trying another one...` or crashes with `EADDRINUSE`.
**Fix:**
```powershell
# In PowerShell: find and kill the process holding port 5173:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force

# Or launch on an alternate port:
pnpm --filter @workspace/frontend dev -- --port 5174
```

---

### Error 2: Cannot find module `@/...` (Path Alias Error)
**Symptom:** `Failed to resolve import "@/components/..." from "src/App.tsx"`
**Cause:** Vite alias or TypeScript path mapping is missing.
**Fix:** Ensure `frontend/vite.config.ts` includes:
```typescript
resolve: {
  alias: {
    '@': path.resolve(import.meta.dirname, 'src'),
    '@assets': path.resolve(import.meta.dirname, '..', 'attached_assets'),
  },
}
```
And `frontend/tsconfig.json` includes:
```json
"compilerOptions": {
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

---

### Error 3: Replit Dev Plugins Failure on Local Windows Machine
**Symptom:** `Cannot find module '@replit/vite-plugin-cartographer'`
**Fix:**
`frontend/vite.config.ts` is already wrapped in conditional checks:
```typescript
...(process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined
  ? [/* Replit plugins */]
  : [])
```
On local machines, `REPL_ID` is not defined, so these plugins are automatically bypassed. If you ever need to completely disable them, simply remove lines 18-30 from `vite.config.ts`.

---

### Error 4: Blank Screen / Uncaught JavaScript Error in Browser
**Symptom:** The browser displays a blank white page.
**Diagnosis:**
1. Open Browser DevTools (`F12` or `Ctrl + Shift + I`).
2. Go to the **Console** tab to view the stack trace.
**Fix:**
`App.tsx` has an `<ErrorBoundary>` wrapping all routes. If a component fails:
- The error boundary displays an error card with the error message and a **"Try again"** button.
- If `App.tsx` itself fails to mount, restore `App.backup.tsx`:
```powershell
Copy-Item "frontend\src\App.backup.tsx" "frontend\src\App.tsx" -Force
```

---

### Error 5: TypeScript Compilation Error (`tsc -p tsconfig.json --noEmit`)
**Symptom:** `error TS...: Cannot find name...`
**Fix:**
Run typecheck to identify the exact file and line number:
```powershell
pnpm --filter @workspace/frontend run typecheck
```
Common causes:
1. Missing import from `lucide-react` or `@/lib/mockData`.
2. Missing prop in a component interface. Check [frontend/src/lib/mockData.ts](file:///c:/Users/WELCOME/Desktop/updated_final_frotned/frontend/src/lib/mockData.ts) for the exact TypeScript interface definitions (`Project`, `District`, `Alert`, etc.).

---

### Error 6: Tailwind CSS v4 Styling Not Loading
**Symptom:** Elements render with unstyled plain text or raw HTML look.
**Fix:**
1. Verify `frontend/vite.config.ts` imports `@tailwindcss/vite` and includes `tailwindcss()` in `plugins: [react(), tailwindcss()]`.
2. Verify `frontend/src/styles/index.css` has `@import "tailwindcss";` at the very top.
3. In `frontend/src/main.tsx`, ensure `import './styles/index.css';` is present.

---

### Error 7: 404 Route / Fallback Not Triggering
**Symptom:** Navigating to an unlisted route displays blank content.
**Fix:**
`wouter` routes in `App.tsx` must end with a fallback:
```tsx
<Switch>
  <Route path="/" component={CommandCenterView} />
  ...
  <Route component={NotFoundPage} />
</Switch>
```

---

## 5. Standalone Execution (Zero-Monorepo Mode)

If you ever want to copy the `frontend` folder to another PC or push it to a repository as an independent project:

1. Copy the `frontend/` folder anywhere.
2. In the copied folder, replace `package.json` with `package.standalone.json`:
   ```powershell
   Copy-Item "package.standalone.json" "package.json" -Force
   ```
3. In `tsconfig.json`, change `"extends": "../tsconfig.base.json"` to:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "jsx": "react-jsx",
       "strict": true,
       "noEmit": true,
       "paths": {
         "@/*": ["./src/*"]
       }
     },
     "include": ["src/**/*"]
   }
   ```
4. Run standard npm:
   ```bash
   npm install
   npm run dev
   ```

---

## 6. Testing & Verification Commands

Run these commands from the repository root anytime to verify frontend health:

| Action | Command | Expected Result |
|--------|---------|-----------------|
| **Run Dev Server** | `pnpm --filter @workspace/frontend dev` | Vite ready at `http://localhost:5173/` |
| **Typecheck** | `pnpm --filter @workspace/frontend run typecheck` | `Exit Code 0` (no errors) |
| **Production Build** | `pnpm --filter @workspace/frontend run build` | `✓ built in ~2s` (bundles to `dist/public`) |
| **Restore App.tsx** | `Copy-Item "frontend\src\App.backup.tsx" "frontend\src\App.tsx" -Force` | Reverts `App.tsx` to verified working state |
