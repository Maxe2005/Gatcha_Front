# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git workflow (required)

For any piece of work beyond a trivial one-line fix: create a dedicated branch (`feat/...`, `fix/...`, `perf/...`) from `development`, commit in atomic steps with French conventional-commit messages (`feat:`/`fix:`/`perf:`/`docs:` + body explaining the why), then merge back with `--no-ff`. Never commit sizeable work directly on `development` or `master`.

## What this is

React front-end for the Gatcha game — a git submodule of the `GatchaApi` orchestrator repo (which has its own CLAUDE.md covering the whole stack). Commits here are independent of the root repo; the root only tracks the pinned commit. Stack: Vite 7 + React 18 + TypeScript, MUI, framer-motion, axios, react-router v6. Node >= 20.19 required.

## Commands

```bash
npm run dev          # Vite dev server on port 3000 (the normal dev workflow)
npm run build        # production build (tsc is NOT run — typecheck separately)
npm run preview
npm run lint         # ESLint (babel parser — does NOT type-check)
npm run format       # Prettier, writes in place
npm run typecheck    # tsc --noEmit
npm test             # vitest run — see Testing below
```

### Testing

Vitest (`vitest.config.ts`, node environment) covers the pure normalization/validation logic of the API service layer: `authService.test.ts`, `invocationService.test.ts`, `monstersService.test.ts`, `joueurService.test.ts` (all colocated under `src/services/`). Each test file mocks `./api` (the axios instances) and `./logger` with `vi.mock` so tests never hit the network; `monstersService.test.ts` also mocks `./indexedDBService` since IndexedDB isn't available under Vitest's node environment. Run a single file with `npx vitest run src/services/authService.test.ts`. UI components have no test coverage yet.

The local `Makefile` (`make up/down/restart/logs/...`) does not run anything locally: it proxies to the root repo's `docker-compose.yaml` scoped to the `gatcha-front` service, which builds the production image (nginx serving `dist/`). For development, use `npm run dev` directly.

### TypeScript is lax on purpose

`tsconfig.json` has `strict: false`, and much of the code is essentially JS in `.tsx` files (untyped params, `any` payloads). `npm run typecheck` must pass, but don't expect strict-mode guarantees, and ESLint won't catch type errors since it uses `@babel/eslint-parser`, not typescript-eslint.

## Architecture

### Every backend call goes through a path-prefix proxy — defined in TWO places

The app never calls backend hosts directly. Requests use path prefixes (`/auth-service`, `/joueur-service`, `/monsters-service`, `/invocation-service`, `/admin-service` → API_generate_gatcha), which are rewritten and forwarded by:

- **Dev**: `server.proxy` in `vite.config.js` (targets `localhost:<port>`)
- **Prod**: `nginx.conf` (targets docker service names)

When adding/changing a service route, update **both** files or it will work in one environment and silently break in the other.

Exception: `imageWsService.ts` opens a WebSocket directly to `window.location.host` at `/api/v1/monsters/images/ws/{batchId}` (image-generation progress from API_generate_gatcha), bypassing the service prefixes.

### API layer

`src/services/apiClient.ts` → `createApiClient(baseURL)` builds an axios instance that:
- injects `Authorization: Bearer <token>` from the `token` **cookie** (auth token lives in a cookie, not localStorage) on every request;
- converts all failures into a typed `ApiError` (`ErrorTypes` enum) with user-facing French messages.

`src/services/api.ts` exports the singleton instances (`authApi`, `joueurApi`, `monstersApi`, `invocationApi`, `adminApi`, `generationApi`). One domain service module per backend (`authService`, `joueurService`, `monstersService`, `invocationService`, `adminService`, `generationService`) wraps these — new endpoints belong in the matching service module, not inline in components.

### State: one React Context per domain

Providers are nested in `src/App.tsx` (Theme → Loading → BackgroundView → Notification → Auth → Monster → Player → Router). `AuthContext` deliberately handles *only* the token/username (cookie storage, deduped `verifyToken`); player data and monsters live in `PlayerContext`/`MonsterContext`. The token is the opaque AES token issued by API_authentification (not a JWT), verified via `/user/verify-token`.

Routing: pages are lazy-loaded with `Suspense`. `PrivateRoute` redirects to `/login` when there's no token. `AdminRoute` (guarding `/admin/*` and `/generate`) requires `user.role === 'ADMIN'` — the role comes from `/user/verify-token` (login/register only return `{token}`, so `AuthContext.login` sets `role: null` and immediately verifies to fill it in; guards treat a null role as "still loading"). Passwords are sent **raw** to the auth service (BCrypt is server-side) — do not reintroduce client-side hashing.

### IndexedDB offline cache

`src/services/indexedDBService.ts` maintains the `GatchaDB` database (stores: `monsters`, `player`, `resources`, `invocationHistory`, plus `cacheMeta` for cache-validity timestamps) as a client-side cache/offline store synchronized with the APIs. When changing store shapes or keyPaths, bump `DB_VERSION` and handle the upgrade in `onupgradeneeded`.

### Conventions and gotchas

- Folder-per-component/page: `Name/Name.tsx` + `Name.css` (co-located styles; a few use `.scss`).
- `vite.config.js` `manualChunks` references **specific source file paths** (e.g. `./src/pages/Gatcha/Gacha.tsx`) — renaming or moving those files breaks the production build config.
- Terser strips `console.*` in production builds, so console logging is dev-only by construction.
- Naming is inconsistent around "Gatcha/Gacha": the page folder is `src/pages/Gatcha/` but the component/file is `Gacha.tsx`, route `/gacha`. Match existing spellings when navigating or importing.
- UI copy (labels, error messages, notifications) is in **French** — keep new user-facing text in French.
