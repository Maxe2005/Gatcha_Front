# Roadmap front — suites de l'audit (P1 / P2)

Le lot P0 (assets WebP, flux gacha → inventaire, typecheck vert, WebSocket images, code mort) est terminé. Étapes suivantes, dans l'ordre recommandé. Chaque item = une branche `feat/...` ou `fix/...` depuis `development`, mergée en `--no-ff` (cf. CLAUDE.md).

## P1 — Code exemplaire

1. ~~**ESLint → typescript-eslint**~~ ✅ fait (`feat/eslint-typescript-eslint`) : parser Babel remplacé par `@typescript-eslint/parser` + plugin, `babel.config.json` et devDeps `@babel/*` supprimées, erreurs révélées corrigées.
2. **Strict TypeScript progressif** — 🟡 en cours (`feat/strict-typescript-progressif`) : `strict: true` est activé dans `tsconfig.json`. `src/services` est intégralement migré (typé proprement, zéro `// @ts-nocheck`). Les ~32 fichiers restants (contexts, components, pages) portent un `// @ts-nocheck` explicite en tête — `npm run typecheck` reste vert, mais ces fichiers ne bénéficient pas encore du contrôle de types. **Prochaine étape** : retirer les `@ts-nocheck` un par un (grep `@ts-nocheck` dans `src/`) et typer, en commençant par `src/context` (plus petit périmètre, peu de fichiers) avant `src/components` puis `src/pages`.
3. ~~**Unifier les notifications**~~ ✅ fait (`feat/unifier-notifications`) : un seul système (`react-hot-toast` via `notificationService`) ; `NotificationContext`/`NotificationStack` supprimés ; `window.confirm`/`alert` de Profile remplacés par `ConfirmDialog` + toast.
4. ~~**Bouton Admin de Home**~~ ✅ fait (`feat/home-admin-button-conditionnel`) : conditionné à `isAdmin`, style déplacé vers `Home.css`.
5. ~~**Particules de Home en canvas**~~ ✅ fait (`feat/home-particules-canvas`) : `CanvasParticleSystem` a maintenant un mode `ambient` (spawn continu + convergence vers le centre, piloté par `requestAnimationFrame`) réutilisé par Home ; le mode `interactive` (clic/traînée) reste utilisé par l'écran de chargement. CSS mortes (`.particle`, `@keyframes float-to-center`) supprimées.

## P2 — Finition pro

1. **Trancher MUI** : soit l'adopter partout (thème MUI branché sur divine/dark au lieu de la palette bleu/rose figée de `main.tsx`), soit le retirer (~70 Ko gzip) au profit des composants CSS maison. Décision à prendre avant tout nouveau composant.
2. **Mutualiser HUD et backgrounds** : extraire un composant `PageBackground` (ciel/nuages/rays/fog dupliqués dans Home, Inventory, Profile) et un `GameHUD` (avatar, niveau, ressources) réutilisables.
3. **Accessibilité de base** : rôles/clavier sur les éléments cliquables (avatar, cartes), focus trap + restauration dans la modale d'inventaire, `prefers-reduced-motion` pour couper les animations lourdes.
4. **Tests Vitest** : installer Vitest + un script `npm test` ; couvrir d'abord les normalisations/validations des services (`authService`, `invocationService`, `monstersService`, `joueurService`) — pur JS, triviales à tester.
5. **Nettoyage final** : purger `docs/` (12 rapports périmés — garder ce fichier et `public/docs/APP_DOC.md`), supprimer les blocs commentés (App.tsx, Portal), corriger la typo d'asset `Cardre_avatar_dark`.

## Rappels transverses

- Ressources or/gemmes/tickets et barre d'XP : affichage mocké tant que l'API joueur ne les fournit pas — brancher ou retirer.
- Sécurité (dépend du backend) : cookie token sans flag `Secure`, et `/admin-service` exposé sans auth par nginx en prod — à traiter côté `API_generate_gatcha`.
