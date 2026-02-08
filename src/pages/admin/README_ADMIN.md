# Guide d'Administration - Gestion des Monstres

## Vue d'ensemble

Cette interface web d'administration permet aux administrateurs de gérer facilement la création, la validation et l'approbation des monstres Gatcha.

## Accès aux pages d'administration

**Les pages d'administration ne sont accessibles que pour les utilisateurs avec le nom d'utilisateur `admin`.**

Après connexion avec `username: admin`, vous verrez deux boutons dans le header:

- **⚙️ Admin** - Accès au tableau de bord d'administration
- **🗂️ Monstres** - Gestion des monstres

### Routes d'administration

| Route                        | Description                       |
| ---------------------------- | --------------------------------- |
| `/admin`                     | Tableau de bord avec statistiques |
| `/admin/monsters`            | Liste des monstres avec filtres   |
| `/admin/monsters/:monsterId` | Détail d'un monstre avec actions  |

## Tableau de Bord (Dashboard)

### Affichage des statistiques

Le tableau de bord affiche:

1. **Total des Monstres** - Nombre total de monstres dans le système
2. **Taux de Transmission** - Pourcentage de monstres transmis avec succès
3. **Temps de Revue Moyen** - Durée moyenne de révision en heures
4. **Distribution par État** - Nombre de monstres pour chaque état
5. **Activité Récente** - Liste des dernières transitions de monstres

### États des monstres

```
GENERATED       → Monstre généré
DEFECTIVE       → Monstre avec erreurs
CORRECTED       → Monstre corrigé
PENDING_REVIEW  → En attente de revue
APPROVED        → Approuvé
TRANSMITTED     → Transmis
REJECTED        → Rejeté
```

## Gestion des Monstres

### Filtrage et pagination

**Filters disponibles:**

- Filtrer par état (tous les états disponibles)
- Pagination avec limite de 20 éléments par défaut

**Colonnes affichées:**

- **Nom** - Nom du monstre
- **Élément** - Type d'élément (FIRE, WATER, WIND, EARTH, etc.)
- **Rang** - Rareté (COMMON, RARE, EPIC, LEGENDARY)
- **État** - État actuel du monstre
- **Valide** - ✓ (valide) ou ✗ (invalide)
- **Créé le** - Date et heure de création

### Actions sur les monstres

Clic sur "Voir détails" pour accéder à la page de détail du monstre.

## Détail du Monstre

### Onglets disponibles

#### 1. Résumé (Summary)

- Affiche toutes les métadonnées du monstre
- Image du monstre (si disponible)
- Informations de révision
- Boutons d'actions selon l'état

**Actions disponibles selon l'état:**

**État PENDING_REVIEW:**

- Bouton "Approuver / Rejeter" - Ouvre une modale de révision

**État DEFECTIVE:**

- Bouton "Corriger" - Ouvre l'éditeur JSON pour corriger

#### 2. Données (Data)

- Affiche les données brutes du monstre en JSON
- Structure complète du monstre incluant stats, skills, descriptions

#### 3. Validation

- Affiche les erreurs de validation si présentes
- Montre le rapport de validation complet
- Indique quels champs ont des problèmes

#### 4. Historique (History)

- Affiche toutes les transitions d'état du monstre
- Montre who a effectué l'action et quand
- Affiche les notes associées à chaque transition

### Workflows de gestion

#### Approuver un monstre (PENDING_REVIEW → APPROVED)

1. Accédez au détail du monstre en état PENDING_REVIEW
2. Cliquez sur "Approuver / Rejeter"
3. Sélectionnez l'action "Approuver"
4. Ajoutez des notes (optionnel)
5. Cliquez sur "Confirmer"

**Résultat:** Le monstre passe à l'état APPROVED

#### Rejeter un monstre (PENDING_REVIEW → REJECTED)

1. Accédez au détail du monstre en état PENDING_REVIEW
2. Cliquez sur "Approuver / Rejeter"
3. Sélectionnez l'action "Rejeter"
4. Ajoutez des notes (recommandé pour expliquer le rejet)
5. Cliquez sur "Confirmer"

**Résultat:** Le monstre passe à l'état REJECTED

#### Corriger un monstre (DEFECTIVE → CORRECTED → PENDING_REVIEW)

1. Accédez au détail du monstre en état DEFECTIVE
2. Cliquez sur "Corriger"
3. Modifiez les données JSON dans l'éditeur
4. Ajoutez des notes décrivant les corrections
5. Cliquez sur "Corriger"

**Résultat:** Le monstre passe automatiquement à CORRECTED puis PENDING_REVIEW

**Important:** Assurez-vous que le JSON est valide avant de soumettre.

## Structure de données d'un monstre

```json
{
  "nom": "Flamewing",
  "element": "FIRE",
  "rang": "RARE",
  "stats": {
    "hp": 45,
    "atk": 65,
    "def": 35,
    "vit": 50
  },
  "description_carte": "Un monstre de feu gracieux...",
  "description_visuelle": "Corps ailé de flammes...",
  "skills": [
    {
      "nom": "Fire Blast",
      "description": "Lance une explosion de feu",
      "effet": "Inflige des dégâts de feu"
    }
  ]
}
```

## Gestion des erreurs

### Erreurs courantes

| Erreur             | Cause                                | Solution                                      |
| ------------------ | ------------------------------------ | --------------------------------------------- |
| JSON invalide      | Format JSON mal formé                | Vérifiez la syntaxe JSON avant de soumettre   |
| État invalide      | Monstre en état incompatible         | Attendez que le monstre soit dans le bon état |
| Données manquantes | Champs requis vides                  | Complétez tous les champs obligatoires        |
| Validation échouée | Données ne respectant pas les règles | Consultez le rapport de validation            |

## Conseils d'utilisation

1. **Lisez le rapport de validation** - Avant de corriger, lisez attentivement les erreurs
2. **Ajoutez des notes** - Les notes aident à suivre les décisions
3. **Vérifiez les stats** - Assurez-vous que les statistiques sont appropriées au rang
4. **Testez localement** - Validez le JSON avant de l'éditer
5. **Suivez les transitions** - Utilisez l'onglet Historique pour comprendre le parcours du monstre

## Interface utilisateur

### Badges d'état

Les états sont codifiés par couleur:

- **Gris** (GENERATED) - État initial
- **Rouge** (DEFECTIVE) - Contient des erreurs
- **Orange** (CORRECTED, REJECTED) - Actions requises
- **Jaune** (PENDING_REVIEW) - En attente
- **Vert** (APPROVED) - Approuvé
- **Bleu** (TRANSMITTED) - Transmis

### Thème sombre

L'interface supporte le thème sombre du système. Utilisez le toggle dans le header.

## Support API

### Base URL

```
http://localhost:8000/api/v1/admin
```

### Documentation interactive

- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Limitations et notes connues

1. **Tri côté serveur** - Le tri par colonne n'est pas encore supporté côté serveur
2. **Pagination** - Le nombre total exact de monstres n'est pas retourné par l'API
3. **Legacy endpoints** - Les anciens endpoints de défectives JSON sont disponibles mais non intégrés à l'UI

## Raccourcis clavier

| Raccourci | Action                    |
| --------- | ------------------------- |
| `Escape`  | Fermer les modales        |
| `Entrée`  | Soumettre les formulaires |

## Contactez l'équipe de développement

Pour des questions ou rapports de bugs, contactez l'équipe de développement Gatcha.
