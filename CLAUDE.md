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

## Direction artistique & design system (charte v1)

Le jeu a deux thèmes exclusifs, basculés par `ThemeContext` (clés de code `divine`/`dark`, conservées telles quelles — la nomenclature marketing ci-dessous n'est qu'une couche de présentation) :

- **Divine Fantasy** (lumière/céleste) : or chaud `#F1C40F`, blanc/ivoire, bleu céleste doux, vert émeraude pastel en touche. Ambiance sereine, triomphante, sanctifiée. God rays, bloom doré, marbre blanc à spires dorées, cascades, prairies scintillantes.
- **Dark Fantasy** (ténèbres/chaos) : violet spectral `#5B2C6F`, noir obsidienne `#0D0D0D`, rouge sang `#922B21`, touches lave/magenta néon. Ambiance oppressante, apocalyptique. Éclairage d'orage, rim-light violet/lave, château gothique, obsidienne craquelée, runes incandescentes.

Les backgrounds illustrés par page/thème sous `public/assets/backgrounds/**` incarnent déjà cette direction (peinture fantasy semi-réaliste) — **c'est la référence à respecter**, pas à réinventer. Le travail de charte consiste à faire respecter ces tons par le CSS/les composants qui s'affichent par-dessus, qui aujourd'hui divergent souvent (voir points ci-dessous).

⚠️ **Écart cross-repo connu** : les portraits de monstres sont générés par `API_generate_gatcha` (Gemini) dans un registre visuel mecha/sci-fi qui **ne correspond pas** à cette direction fantasy peinte. C'est un chantier prioritaire séparé côté prompt engineering de `API_generate_gatcha` — ne pas essayer de le compenser côté front.

### Rareté — palette fixe, indépendante du thème actif

La rareté (`COMMON`/`RARE`/`EPIC`/`LEGENDARY`) prime sur l'ambiance : un LEGENDARY doit rester identifiable à l'identique en Divine comme en Dark. Ne **jamais** réutiliser une teinte déjà prise par un thème (ex: l'or Divine `#F1C40F` était par le passé identique au flat-color LEGENDARY — collision corrigée, à ne pas réintroduire).

- `COMMON` — argent/gris pierre
- `RARE` — cyan électrique
- `EPIC` — magenta franc
- `LEGENDARY` — traitement prismatique/holographique (dégradé animé multi-teintes), jamais un or plat

Source de vérité unique : les badges illustrés `public/assets/ranks/Rank_*.webp` (déjà utilisés dans `GatchaCard`/`SkillCard`) sont la représentation canonique de la rareté **partout**, y compris dans l'Inventaire — pas de tags texte à couleur plate custom par écran.

### Tokens

- **Typo** : `--font-title`/`--font-body` par thème (inchangé). Échelle de tailles à respecter partout : `display` 2.5rem (écrans cinématiques), `h1` 2rem, `h2` 1.5rem, `body` 1rem, `small` 0.85rem, `caption` 0.75rem — chacune avec poids/line-height fixés, pas de taille ad hoc par fichier.
- **Espacement** : grille 4/8px (4/8/12/16/24/32/48/64).
- **Rayons** : `--radius-sm: 6px` (inputs, tags), `--radius-md: 10px` (cards), `--radius-lg: 16px` (modales, panels), `--radius-pill: 999px` (chips/boutons ronds), `--radius-circle: 50%` (avatars). Toute nouvelle valeur de radius doit venir de cette échelle.
- **Motion** — plus une animation est spectaculaire, plus elle doit rester rare (sinon plus rien ne se démarque au moment du pull) :
  - `motion-micro` 120–150ms ease-out : hover/focus, partout.
  - `motion-transition` 250–400ms ease-in-out : navigation, ouverture modale.
  - `motion-cinematic` 1.2–2s, courbes signature : réservé au portail/reveal/changement de thème.
- **Z-index** : `base(0) → content(1-10) → nav-sticky(100) → dropdown(200) → overlay-transition(250-300) → modal-backdrop(900) → modal(1000) → toast(1100) → cinématique plein écran(9000+)`. Toute nouvelle overlay se case dans cette liste, jamais un nombre inventé.

### Admin — identité sobre du jeu, pas un skin détaché

Les backgrounds illustrés admin existants (`public/assets/backgrounds/admin/**`) sont bons et se gardent. Le chrome (boutons, filtres, chips, nav) doit reprendre les tokens du jeu (accent or/sang, échelle de rayons ci-dessus) au lieu de dégradés génériques type SaaS (`#667eea`, `#f093fb`, etc. — à bannir). Titres/nav en `--font-title` pour garder le lien de marque ; contenu dense (tableaux, JSON, historique) en famille utilitaire (`Inter` ou équivalent) — c'est le seul endroit où mélanger les polices est légitime, la lisibilité de la donnée prime sur l'immersion. `AdminNav` doit être persistant sur toutes les routes `/admin/*` et `/generate` (layout partagé), pas limité à une seule page.

### Accessibilité modale (règle commune)

Toute modale (`ConfirmDialog` et équivalents admin) doit avoir `role="dialog"`, `aria-modal="true"`, piège de focus (`useFocusTrap`), et fermeture au `Escape` — c'est déjà le standard appliqué dans la modale de détail de l'Inventaire, à généraliser plutôt qu'à ré-inventer par écran.
