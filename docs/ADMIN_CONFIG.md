# Configuration Admin - Variables d'environnement

## Variables d'environnement nécessaires

Aucune variable d'environnement spéciale n'est requise pour l'interface admin.

## Configuration de l'API Admin

### URL de base

```
http://localhost:8000/api/v1/admin
```

### Endpoints disponibles

**Dashboard:**

- `GET /dashboard/stats` - Statistiques du dashboard

**Monstres:**

- `GET /monsters` - Liste des monstres
- `GET /monsters/{monster_id}` - Détail d'un monstre
- `GET /monsters/{monster_id}/history` - Historique des transitions
- `POST /monsters/{monster_id}/review` - Approuver/Rejeter
- `POST /monsters/{monster_id}/correct` - Corriger un monstre

**Legacy Defectives:**

- `GET /defective` - Liste des JSON défectueux
- `GET /defective/{filename}` - Détail d'un JSON défectueux
- `POST /defective/{filename}/validate` - Valider
- `PUT /defective/{filename}/update` - Mettre à jour
- `POST /defective/{filename}/approve` - Approuver
- `POST /defective/{filename}/reject` - Rejeter

**Validation:**

- `GET /validation-rules` - Règles de validation

## Authentification

L'interface admin vérifie que `user.username === 'admin'` côté client.

Pour accéder à l'interface admin:

1. Se connecter avec `username: admin`
2. Les routes `/admin*` seront accessibles

## Développement local

### Prérequis

- Node.js 14+
- npm ou yarn
- l'API gatcha_generator_api sur `http://localhost:8000`

### Démarrage

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Test des endpoints API

Utilisez Swagger: `http://localhost:8000/docs`

## Structure des fichiers admin

```
src/
├── pages/admin/
│   ├── AdminDashboard.jsx       # Tableau de bord
│   ├── AdminDashboard.css       # Styles du dashboard
│   ├── AdminMonstersList.jsx    # Liste des monstres
│   ├── AdminMonstersList.css    # Styles liste
│   ├── AdminMonsterDetail.jsx   # Détail monstre
│   ├── AdminMonsterDetail.css   # Styles détail
│   └── README_ADMIN.md          # Documentation admin
├── components/
│   ├── AdminNav.jsx             # Navigation admin
│   └── AdminNav.css             # Styles navigation admin
├── services/
│   ├── api.js                   # Configuration axios (mis à jour)
│   └── adminService.js          # Service utils admin
└── context/
    └── AuthContext.jsx          # Authentification (mis à jour)
```

## Codes d'état HTTP attendus

| Code | Signification                        |
| ---- | ------------------------------------ |
| 200  | Succès                               |
| 400  | Requête invalide (données mauvaises) |
| 401  | Non authentifié                      |
| 403  | Non autorisé                         |
| 404  | Monstre non trouvé                   |
| 500  | Erreur serveur                       |

## Dépannage

### L'interface admin n'apparaît pas

- Vérifiez que vous êtes connecté avec `username: admin`
- Vérifiez que le token est valide

### Les API ne répondent pas

- Vérifiez que l'API gatcha_generator_api est lancée sur `http://localhost:8000`
- Vérifiez que le CORS est configuré correctement

### Erreur JSON invalide

- Vérifiez la syntaxe JSON dans l'éditeur
- Utilisez un validateur JSON externe au besoin

## Performance

- La pagination est limitée à 200 éléments max
- Le cache n'est pas implémenté (chaque action recharge les données)
- Pour davantage de performance, envisagez une implémentation avec React Query ou SWR
