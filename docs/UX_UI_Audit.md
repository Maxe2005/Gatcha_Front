# Audit UX/UI — Pages de l'application

Ce document décrit, page par page, l'interface utilisateur existante dans le projet. L'objectif est de donner une vision claire et détaillée de chaque page sans avoir à ouvrir l'interface graphique.

---

**Méthodologie** : description fonctionnelle, éléments UI visibles (composants réutilisables), interactions, états (loading / error), dépendances API/services, points d'accessibilité et notes visuelles (animations, particules, thèmes).

---

## Page : Home

- **Fichier principal** : `src/pages/Home/Home.tsx`
- **Styles** : `src/pages/Home/Home.css`
- **Route / contexte d'accès** : page d'accueil après authentification; affiche résumé joueur et accès au portail/gacha.
- **But principal** : présenter l'état du joueur (ressources, progression) et permettre l'accès au portail (animation de transition vers la page Gacha).
- **Composants utilisés** : `ThemeToggle`, `Portal` (composant d'interaction pour lancer l'animation/transition), éventuellement composants d'affichage de profil et liste de ressources.
- **Données attendues** : `playerData` via `PlayerContext` (gold, gems, tickets, experience, etc.). Le code prévoit des valeurs par défaut/mock si `playerData` manquant.
- **Interactions clés** :
  - Appui sur le bouton/zone du portail lance une animation de warp puis navigation vers `/gacha`.
  - Eléments cliquables vers d'autres sections éventuelles (inventaire, profil).
- **États UI** :
  - Chargement initial (petit délai simulé avec setTimeout) pour jouer l'animation d'entrée.
  - Etat de transition (bloque double-clic pendant animation).
- **Visuel / animations** : effets de particules / transitions (réglés via `particleSystem.ts` et styles globaux), warp animation d'environ 2s avant navigation.
- **Accessibilité / responsive** : pas d'indication explicite dans le code, mais la structure React et CSS suggère adaptation responsive; vérifier présence d'attributs aria dans composants réutilisables.

---

## Page : Gacha (tirage)

non implémentée

---

## Page : Profil 

non implémentée

---

## Page : Inventory (Inventaire)

- **Fichier principal** : `src/pages/Inventory/Inventory.tsx`
- **Styles** : `src/pages/Inventory/Inventory.css`
- **But principal** : afficher la collection de monstres du joueur, leurs cartes et compétences associées.
- **Composants utilisés** : `GatchaCard`, `SkillCard`, `ThemeToggle`.
- **Données** : `playerData` depuis `PlayerContext`. Le code inclut `MOCK_INVENTORY` pour le développement si le vrai inventaire est vide.
- **Interactions clés** :
  - Filtrage / tri (non explicite dans l'extrait mais souvent présent dans inventaires).
  - Sélection d'une carte pour afficher détails (compétences, stats) — `SkillCard` pour compétences.
- **États UI** :
  - Chargement initial, fallback mock si pas de données.
  - Affichage en grille; pagination ou virtualisation possible via `VirtualList` (présence d'un composant `VirtualList` dans le projet suggère utilisation possible dans inventory).
- **Visuel / layout** : grille de cartes, chaque carte présente image (ou placeholder), nom, élément, rang et statistiques sommaires.

---

## Page : Login (Authentification)

- **Fichier principal** : `src/pages/Login/Login.tsx`
- **Styles** : `src/pages/Login/Login.scss`
- **But principal** : formulaire de connexion utilisateur.
- **Composants utilisés** : MUI (`TextField`, `Button`, `Typography`, `InputAdornment`, `CircularProgress`, `IconButton`, `Collapse`, `Alert`), `ThemeToggle`.
- **Services / API** : `authService`, `joueurService` (probablement pour récupération du profil), `AuthContext` pour gérer l'état d'authentification.
- **Interactions clés** :
  - Saisie identifiant/mot de passe avec visibilité du mot de passe (icônes `Visibility` / `VisibilityOff`).
  - Bouton de soumission déclenchant l'appel au `authService`.
  - Affichage d'alertes d'erreur via `Alert` en cas d'échec.
  - Indicateur de progression `CircularProgress` pendant l'appel.
- **États UI** :
  - Champ(s) invalides -> messages d'erreur.
  - Loading sur authentification.
  - État connecté -> redirection (via `useNavigate`).
- **Accessibilité** : usage de MUI facilite la conformité (labels, focus), s'assurer d'avoir des labels explicites et gestion clavier.

---

## Pages : Administration (dossier `src/pages/admin`)

L'espace admin est structuré en plusieurs pages et composants dédiés à la gestion des monstres et du système.

- **Fichiers principaux** :
  - `src/pages/admin/AdminDashboard/AdminDashboard.jsx` — tableau de bord (stats globaux).
  - `src/pages/admin/AdminMonstersList/AdminMonstersList.jsx` — liste et filtrage des monstres.
  - `src/pages/admin/AdminMonsterDetail/AdminMonsterDetail.jsx` — vue détaillée d'un monstre avec onglets.
  - `src/pages/admin/GenerateMonsters/GenerateMonsters.jsx` — outil/écran pour générer des monstres (dev/admin).
  - Modals utilitaires : `CorrectModal.jsx`, `ReviewModal.jsx`, `RejectModal.jsx`.

- **Composants / onglets spécifiques** (dans `AdminMonsterDetail`):
  - `MonsterSummaryTab` — résumé et métadonnées.
  - `MonsterDataTab` — édition des champs de données du monstre.
  - `MonsterValidationTab` — outils de validation/approbation.
  - `MonsterHistoryTab` — historique des modifications.
  - `MonsterPreviewTab` — aperçu visuel de la carte/fiche monstre.
  - `MonsterImagesTab` — gestion des images (upload, sélection d'image par défaut).

- **Services / API** : `adminApi` et `adminApiService` pour récupérer stats, liste, détails, effectuer actions (approve/reject/update).
- **Interactions clés** :
  - Recherche, filtres, tri et pagination (présence de states limit/offset, sauvegarde locale des filtres).
  - Actions sur items (transmettre, corriger, valider, supprimer) avec dialogues de confirmation (`ConfirmDialog`).
  - Dans `AdminMonsterDetail` : changement d'onglet, édition des données, validation des changements, gestion des images.
- **États UI** :
  - Loading pour fetch des listes et détails.
  - Feedback d'opération (processMessage / processing) pendant actions longues.
  - Gestion d'erreurs avec affichage explicite.
- **Visuel / layout** : listes tabulaires ou cartes; dashboard tile-based affichant statistiques.

---

## Pages utilitaires ou annexes repérées

- `src/pages/admin/README_ADMIN.md` — documentation interne pour l'administration (utile pour comprendre flux et exigences UX côté admin).
- `src/pages/admin/GenerateMonsters` — écran de génération (indique des besoins UX pour workflows de masse / batch creation).

---

## Composants transverses influençant fortement l'UX

- **ThemeToggle** : bascule thème clair/sombre accessible sur plusieurs pages.
- **Portal** : composant d'entrée vers le Gacha — animation/transition importante pour l'expérience principale.
- **GatchaCard, SkillCard** : cartes de monstre et compétences — éléments visuels centraux pour Inventaire et Gacha.
- **NotificationStack / notificationService** : feedback utilisateur (succès/erreur) utilisé par Gacha et autres écrans.
- **Particle system & transitions** : `particleSystem.ts`, `particles.scss`, `transitions.css` apportent animations et ambiance — impact sur performance et lisibilité.

---

## Recommandations rapides (UX à vérifier)

- Valider les comportements accessibles (tab order, aria-labels) sur formulaires (Login) et actions critiques (Admin actions).
- Documenter les états d'erreur côté API (format des messages) pour standardiser l'affichage d'alertes.
- Vérifier la performance des animations (particules, reveals) sur mobile et proposer opt-out si nécessaire.
- Uniformiser les composants de feedback (toasts vs alerts) pour cohérence utilisateur.

---

## Annexes — fichiers source références

- `src/pages/Home/Home.tsx`
- `src/pages/Gatcha/Gacha.tsx`
- `src/pages/Inventory/Inventory.tsx`
- `src/pages/Login/Login.tsx`
- `src/pages/admin/AdminDashboard/AdminDashboard.jsx`
- `src/pages/admin/AdminMonstersList/AdminMonstersList.jsx`
- `src/pages/admin/AdminMonsterDetail/AdminMonsterDetail.jsx`

---

Document créé automatiquement par audit statique du code. Pour plus de précision (captures écran, parcours utilisateur), je peux :

- ajouter des wireframes rapides par page;
- extraire les props détaillées des composants (`GatchaCard`, `Portal`, `GatchaCard`) ;
- générer une checklist d'accessibilité page par page.
