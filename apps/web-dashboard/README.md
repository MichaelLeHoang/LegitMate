# web-dashboard

The LegitMate marketing/landing web UI (React 19 + TypeScript + Vite + Tailwind v4),
featuring the "egg detective" mascot and an interactive in-page preview of the
extension popup.

This shares its visual language and the `MascotEgg` component with
`apps/extension`. The on-page scan results here are driven by a local heuristic
mock (`src/utils/analyzer.ts`) for demonstration — the real, source-attributed
scoring lives in the extension + `services/api`.

## Commands

Run from the repo root:

```bash
npm install
npm run dev:web        # vite dev server
npm run build:web      # tsc --noEmit && vite build -> apps/web-dashboard/dist
npm run typecheck:web  # tsc --noEmit
```

Or from this directory: `npm run dev` / `npm run build` / `npm run preview`.
