<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project

**Sistem Manajemen Denah Ujian SMP** — exam seating arrangement manager for a middle school.
Client-side only. No database, no API routes, no auth. All data persisted in `localStorage`.

## Commands

```
npm run dev    # dev server
npm run build  # production build
npm run lint   # ESLint (no typecheck script; tsc --noEmit is implicit via build)
```
No test framework is configured. Do not invent one.

## Key tooling quirks

- **Next.js 16** + **React 19** + **Tailwind CSS v4** — all have breaking changes vs typical training data. Tailwind v4 uses `@tailwindcss/postcss` (no `tailwind.config.js`).
- **`exceljs`** is declared in `serverExternalPackages` in `next.config.ts`. Only import it in server code or it will break the client bundle.
- **Path alias**: `@/*` maps to project root (e.g. `@/lib/types`).

## Architecture

```
/app                  — App Router pages: /, /upload, /ruangan, /denah, /absensi
/components           — shared UI components
/lib                  — pure utility modules (types, excel import/export, seating algorithms)
/store                — Zustand global state (single store: useAppStore)
```

- **DataProvider** (in root layout) loads store from `localStorage` on mount via a `useEffect`.
- All page state flows through the single Zustand store (`store/useAppStore.ts`).
- Domain terms are Indonesian: `ruangan` (room), `denah` (layout), `absensi` (attendance), `kapasitas` (capacity).

## Style & conventions

- Indonesian variable/function naming throughout the codebase — match it.
- `crypto.randomUUID()` is used for generating IDs — works in browser context.
- No CI workflows or pre-commit hooks configured.
