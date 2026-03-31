# Guide de Test - Interface Admin

## Prérequis

1. **API gatcha_generator_api** lancée sur `http://localhost:8000`
   - Swagger disponible sur `http://localhost:8000/docs`
   - ReDoc disponible sur `http://localhost:8000/redoc`

2. **Gatcha Front** lancée localement
   - Démarrez avec: `npm run dev`
   - Accessible sur: `http://localhost:5173` (ou le port Vite configuré)

3. **Compte admin** créé dans l'API
   - Username: `admin`
   - Token valide

## Scénarios de test

### 1. Test d'accès - Utilisateur non-admin

**Étapes:**

1. Lancez l'application
2. Connectez-vous avec un utilisateur non-admin
3. Tentez d'accéder à `http://localhost:5173/admin`

**Résultat attendu:**

- ✅ Redirection automatique vers `/home`
- ✅ Les boutons Admin n'apparaissent pas dans le header
- ✅ Impossible d'accéder aux routes `/admin*`

### 2. Test d'accès - Utilisateur admin

**Étapes:**

1. Connectez-vous avec `username: admin`
2. Vérifiez la présence des boutons dalam le header

**Résultat attendu:**

- ✅ Boutons "⚙️ Admin" et "🗂️ Monstres" visibles
- ✅ Accès aux routes `/admin*` sans redirection
- ✅ Protection fonctionnelle au niveau de la route

### 3. Test du Dashboard

**Étapes:**

1. Cliquez sur "⚙️ Admin" ou naviguez vers `/admin`
2. Vérifiez que le dashboard se charge

**Résultat attendu:**

- ✅ Les 3 KPIs s'affichent (total, taux transmission, temps moyen)
- ✅ Distribution par état visible
- ✅ Activité récente affichée
- ✅ Pas d'erreur dans la console

### 4. Test de la liste des monstres

**Étapes:**

1. Cliquez sur "🗂️ Monstres"
2. Vérifiez que le tableau se charge
3. Testez le filtre par état
4. Testez la pagination

**Résultat attendu:**

- ✅ Tableau affiche colons: nom, élément, rang, état, validité, créé le
- ✅ Filtres fonctionnent correctement
- ✅ Pagination navigation (Previous/Next)
- ✅ Chaque monstre a un bouton "Voir détails"

### 5. Test du détail d'un monstre (PENDING_REVIEW)

**Étapes:**

1. Filtrez par état PENDING_REVIEW
2. Cliquez sur "Voir détails" pour un monstre
3. Vérifiez les 4 onglets

**État Résumé (Summary):**

- ✅ Affiche toutes les métadonnées
- ✅ Image visible (si disponible)
- ✅ Bouton "Approuver / Rejeter" présent

**Onglet Données:**

- ✅ JSON du monstre visible et lisible
- ✅ Formatage JSON correct

**Onglet Validation:**

- ✅ Affiche les erreurs de validation (si pré resentes)
- ✅ Champ + message d'erreur visible

**Onglet Historique:**

- ✅ Transitions affichées dans l'ordre chronologique
- ✅ État initial → État actuel dans chaque transition

### 6. Test d'approbation d'un monstre

**Étapes:**

1. Consultez un monstre PENDING_REVIEW
2. Cliquez sur "Approuver / Rejeter"
3. Sélectionnez "Approuver"
4. Ajoutez una note (optionnel)
5. Cliquez sur "Confirmer"

**Résultat attendu:**

- ✅ Modale s'affiche
- ✅ État du monstre devient APPROVED
- ✅ Note sauvegardée (visible dans historique)
- ✅ Modale se ferme automatiquement
- ✅ Alerte "Monstre apprové avec succès"

### 7. Test de rejet d'un monstre

**Étapes:**

1. Consultez un monstre PENDING_REVIEW
2. Cliquez sur "Approuver / Rejeter"
3. Sélectionnez "Rejeter"
4. Ajoutez une note (recommandé)
5. Cliquez sur "Confirmer"

**Résultat attendu:**

- ✅ État du monstre devient REJECTED
- ✅ Note ajoutée visible dans historique
- ✅ Monstre n'apparaît plus dans la liste PENDING_REVIEW

### 8. Test de correction d'un monstre (DEFECTIVE)

**Étapes:**

1. Filtrez par état DEFECTIVE
2. Cliquez sur "Voir détails"
3. Cliquez sur "Corriger"
4. Modifiez le JSON (corrigez au moins une erreur)
5. Ajoutez une note describing the fix
6. Cliquez sur "Corriger"

**Résultat attendu:**

- ✅ Modale avec éditeur JSON s'affiche
- ✅ Données actuelles pré-remplies
- ✅ Après validation:
  - État → CORRECTED
  - État → PENDING_REVIEW (automatique)
- ✅ Monstre apparaît maintenant dans la liste PENDING_REVIEW
- ✅ Historique montre 2 transitions

### 9. Test des thèmes

**Étapes:**

1. Cliquez sur le toggle de thème
2. Naviguez dans les différentes pages admin

**Résultat attendu:**

- ✅ Tous les éléments changent de thème
- ✅ Couleurs claires/sombres appropriées
- ✅ Texte lisible dans both themes
- ✅ Contrastes respectés (WCAG)

### 10. Test du responsive design

**Étapes:**

1. Ouvrez les outils de développement (F12)
2. Activez le mode responsive
3. Testez les breakpoints:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)

**Résultat attendu:**

- ✅ Layout s'adapte correctement
- ✅ Tableaux scrollables sur mobile
- ✅ Boutons accessibles sur tous les appareils
- ✅ Pas de chevauchement d'éléments
- ✅ Textes visibles sans zoom

## Tests d'erreur

### Erreur API

**Pour simuler une erreur API:**

1. Arrêtez le serveur API
2. Tentez une action qui require une requête API

**Résultat attendu:**

- ✅ Message d'erreur affiché à l'utilisateur
- ✅ Pas d'erreur JavaScript dans la console
- ✅ L'App reste fonctionnelle

### Données invalides

**Étapes:**

1. Tentez de corriger un monstre avec JSON invalide
2. Cliquez sur "Corriger"

**Résultat attendu:**

- ✅ Message d'erreur: "Données JSON invalides"
- ✅ La requête n'est pas envoyée
- ✅ Modale reste ouverte

### Lecture seule des données

**Étapes:**

1. Accédez à un monstre GENERATED (non PENDING_REVIEW, non DEFECTIVE)
2. Vérifiez la présence/absence des boutons d'actions

**Résultat attendu:**

- ✅ Aucun bouton d'action visible
- ✅ Les onglets sont visibles (lecture seule)

## Performance et charge

### Test de pagination

**Étapes:**

1. Aller à la liste des monstres
2. Paginez à travers plusieurs pages (Previous/Next)
3. Vérifiez que les données se chargent correctement

**Résultat attendu:**

- ✅ Chaque page charge rapidement
- ✅ Données correctes après pagination
- ✅ Pas de données dupliquées/manquantes

### Test avec beaucoup de monstres

**Étapes:**

1. Créez plusieurs (100+) monstres via l'API
2. Accédez à la liste admin

**Résultat attendu:**

- ✅ Page se charge sans lag
- ✅ Pagination fonctionne correctement
- ✅ Filtres rapides

## Checklist final

- [ ] Accès admin fonctionne
- [ ] Dashboard se charge
- [ ] Liste des monstres visible
- [ ] Filtres et pagination fonctionnent
- [ ] Détail d'un monstre affiche tous les onglets
- [ ] Approbation fonctionne
- [ ] Rejet fonctionne
- [ ] Correction fonctionne
- [ ] Historique affiche les transitions
- [ ] Thèmes clair/sombre fonctionnent
- [ ] Design responsive sur mobile
- [ ] Gestion d'erreurs ok
- [ ] Console sans erreurs JavaScript

## Signaler un bug

Si vous trouvez un problème:

1. **Collectez les infos:**
   - URL where the error occurred
   - Erreur dans la console (F12)
   - Étapes pour reproduire
   - Navigateur utilisé

2. **Vérifiez dans la console (F12):**
   - Onglet "Console" pour les JavaScript errors
   - Onglet "Network" pour les requêtes API
   - Onglet "Application" pour les cookies/storage

3. **Contactez l'équipe dev** avec ces infos

---

**Date du test:** [À remplir]
**Testeur:** [À remplir]
**Version API:** [À remplir]
**Résultat:** ✅ Passé / ❌ Échoué
