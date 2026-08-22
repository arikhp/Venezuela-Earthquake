# AGENTS.md

## Cursor Cloud specific instructions

This repository is a single, frontend-only React 19 + Vite 8 single-page app (`building-dashboard`) — the "Building Inspection Dashboard". Data is bundled statically from `src/buildings.json`; there is **no backend, database, API, or auth**.

### Services

| Service | Command | Notes |
| --- | --- | --- |
| Vite dev server | `npm run dev` | Long-running; run in a dedicated terminal. Serves at `http://localhost:5173/Venezuela-Earthquake/` |

Standard scripts live in `package.json` (`dev`, `build`, `preview`, `lint`, `deploy`).

### Non-obvious notes

- The app is served under the base path `/Venezuela-Earthquake/` (set via `base` in `vite.config.js`). The root URL `http://localhost:5173/` returns 404 — you MUST use `http://localhost:5173/Venezuela-Earthquake/`.
- The map component (`src/components/BuildingMap.jsx`) fetches tiles from the public OpenStreetMap tile servers over HTTPS. Without outbound internet the UI, charts, and filters still work, but map background tiles render blank. This is not a setup failure.
- `npm run lint` uses Oxlint and currently exits 0 with one pre-existing `no-unused-vars` warning in `src/components/StatsPanel.jsx`.
- `npm run build` prints a "chunks larger than 500 kB" warning (Leaflet + Recharts bundle); this is expected and not an error.
