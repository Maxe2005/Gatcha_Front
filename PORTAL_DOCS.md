# 🔮 Portal Component - Documentation

## Vue d'ensemble

Le composant Portal est le point focal de la page Home de Gacha Quest. Il représente la porte d'invocation majestueuse qui incarne le cœur du gameplay.

### Caractéristiques clés

- **Reconnaissable en 0.5s** : Silhouette distinctive, massif, ancien, vivant
- **Architecture en couches** : 5 couches visibles + système de particules
- **Thèmes dual** : Divine (or/blanc) et Dark (rouge/noir)
- **3 États animés** : Idle, Hover, Activating/Active
- **Morphing dynamique** : Éléments qui changent aléatoirement (6 types)

---

## 🏗️ Structure en couches

### Couche A - Anneau externe (Ring Layer)
**z-index: 100**

- Image PNG haute résolution (Divine/Dark)
- Anneau massif sculpté
- Animation de respiration subtile
- Glow adapté au thème
- Flash lors de l'activation

```jsx
<div className="ring-layer">
  <div className={`ring ring-${theme}`}>
    <img src={anneau} alt="Anneau" />
  </div>
</div>
```

### Couche B - Glyphes & Runes (Glyphes Layer)
**z-index: 80**

- 8 glyphes disposés circulairement
- Animation de rotation inverse au vortex (lent en idle, rapide en hover)
- Pulsation + glow
- Changement d'opacité selon l'état

**Positions** : 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°

```jsx
{[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
  <div key={`glyph-${index}`} className="glyph">
    <div className="glyph-symbol" />
    {state !== 'idle' && <div className="glyph-glow" />}
  </div>
))}
```

### Couche C - Cercle élémentaire (Element Circle Layer)
**z-index: 60**

6 types d'éléments qui morphent dynamiquement :
- **Feu** : Cercle_feu.png
- **Eau** : Cercle_eau.png
- **Terre** : Cercle_terre.png
- **Vent** : Cercle_vent.png
- **Lumière** : Cercle_light.png
- **Obscurité** : Cercle_dark.png

**Animations** :
- Respiration continue (scale 1 → 1.08)
- Ripple visible au hover
- Morphing lors de changement d'élément
- Glow pulsant adapté au thème

### Couche D - Vortex / Noyau central (Vortex Layer)
**z-index: 40** - **LE PLUS IMPORTANT**

- Image vidéo/animée du vortex (profond, hypnotique)
- Rotation : 8s (idle) → 5s (hover) → 2s (activating)
- Glow massif (25px drop-shadow)
- Pulse lors de l'activation
- Respiration subtile

### Couche E - Particules (Particles Layer)
**z-index: 50** - Pointeur non-interactif

Système de particules continu :
- Génération toutes les 150ms en idle/hover
- Max 40 particules simultanées
- Animation float-to-center (2-3s)
- Couleur adaptée au thème
- Glow lumineux

---

## 🎯 États visuels

### 1️⃣ Idle (par défaut)
```css
/* Animations lentes, subtiles */
- Ring: scale 1 → 1.02, -5° rotation
- Glyphs: rotation 12s
- Vortex: rotation 8s
- Element: breathing 3s
- Particles: floatage naturel
```
**Sensation** : Solennité, attente, mystère

### 2️⃣ Hover
```css
/* Accélération légère, intensification */
- Ring: scale 1.03 → 1.06, -10° rotation
- Glyphes: rotation 8s, opacity 0.6 → 0.9
- Vortex: rotation 5s, shimmer 0.3s
- Element: breathing 2s, ripple actif
- Glow: ×1.5
```
**Sensation** : Engagement, anticipation, puissance croissante

### 3️⃣ Activating (0.6s)
```css
/* Accélération brutale, instabilité */
- Ring: scale 1 → 1.15, opacity 1 → 0.6, flash blanc
- Glyphes: rotation 540° en 0.8s
- Vortex: rotation 2s, pulse burst
- Element: scale 1 → 1.3, opacity fade
- Blackout flash (0.4s)
```
**Sensation** : Décharge d'énergie, rupture dimensionnelle, danger

### 4️⃣ Active (0.6s)
État transitoire après activation (blackout clearing)
- Retour progressif à idle après 1.2s total

---

## 🌗 Thèmes : Divine vs Dark

| Aspect | Divine | Dark |
|--------|--------|------|
| **Matière** | Marbre blanc / Or | Obsidienne / Pierre noire |
| **Couleurs** | Or (#ffd700), Blanc, Bleu | Rouge (#cc2222), Noir |
| **Glyphes** | Doré lumineux | Rouge sombre / Cramoisi |
| **Glow** | Blanc chaud | Irrégulier / "vivant" |
| **Particules** | Lumière dorée | Braises rouges |
| **Vortex** | Blanc-doré, stable | Rouge profond, chaotique |
| **Émotion** | Solennité | Danger, corruption |

**CSS Variables** :
```css
.portal-container.divine {
  --glyph-color: #ffd700;
  --glyph-glow: rgba(255, 223, 0, 0.8);
  --vortex-glow: rgba(255, 200, 100, 0.6);
}

.portal-container.dark {
  --glyph-color: #cc2222;
  --glyph-glow: rgba(255, 50, 50, 0.9);
  --vortex-glow: rgba(200, 0, 0, 0.7);
}
```

---

## 📊 Performance

### Optimisations

1. **Layering efficace** : CSS positioning + z-index au lieu de canvas
2. **Animations CSS** : GSAP non nécessaire (CSS3 suffisant)
3. **Particules limitées** : Max 40 simultanées
4. **Images optim** : PNG/SVG HD downscalées dynamiquement
5. **Repaints minimisés** : transform + opacity uniquement

### Budgets

- **CPU** : <5% idle, <15% hover
- **Memory** : ~15-20 MB
- **Render** : 60fps maintenu

---

## 🧩 Intégration React

### Props

```jsx
<Portal 
  onInvoke={(element) => {
    // Callback lors de click + activation
    // element = 'feu' | 'eau' | 'terre' | 'vent' | 'lumiere' | 'darkness'
    navigate('/gacha');
  }}
  isLoading={false} // Affiche ring de loading
/>
```

### Événements

- `onInvoke(element)` : Déclenché après animation d'activation complète
- Theme automatiquement récupéré via `useTheme()` context

### Hooks utilisés

```jsx
import { useTheme } from '../context/ThemeContext';
// Réactif au changement de thème
```

---

## 🎨 Customisation

### Changer les durées d'animation

[Portal.css] - Modifiez les `@keyframes` :

```css
@keyframes ring-idle {
    /* Changez les durées dans animation: X-ms */
}
```

### Ajouter un nouvel élément

1. Ajouter image à `/public/assets/portail/cercles_elementaires/`
2. Mettre à jour `elementToCircle` object dans Portal.jsx
3. Ajouter à array `elements`

```jsx
const elements = ['feu', 'eau', 'terre', 'vent', 'lumiere', 'darkness', 'nouveau'];
const elementToCircle = {
  // ...
  nouveau: 'Cercle_nouveau.png',
};
```

### Modifier les glyphes

Les glyphes sont générés par CSS circles simples. Pour des glyphes custom :

1. Créer SVG des glyphes
2. Remplacer `.glyph-symbol` par `<img>`
3. Ajuster les tailles/positions

---

## 🔧 Troubleshooting

### Le portail ne réagit pas au hover
- Vérifier `pointer-events: none` sur les couches participantes
- Vérifier z-index du portal-container vs autres éléments

### Les animations saccadent
- Réduire le nombre de particules (max 40)
- Vérifier GPU acceleration : `will-change: transform`
- Profile avec DevTools > Performance

### Les glyphes ne s'affichent pas
- Vérifier assets glyphes existents
- Vérifier CSS variables définies pour le thème
- Vérifier z-index (80)

### Theme ne change pas dynamiquement
- Vérifier ThemeContext provider en place
- Vérifier `window.dispatchEvent` écouté
- Forcer re-render : `setState(() => ({}))`

---

## 📁 Fichiers

```
src/
├── components/
│   ├── Portal.jsx         # Composant principal
│   └── Portal.css         # Toutes les animations & styles
├── pages/
│   ├── Home.jsx           # Intégration du Portal
│   └── Home.css           # Styles Home (nettoyé)
└── context/
    └── ThemeContext.jsx   # Theme switching logic

public/assets/portail/
├── Anneau_portail_divine.png
├── Anneau_portail_dark.png
├── Vortex_portail_divine.png
├── Vortex_portail_dark.png
├── Particules_portail_divine.png
├── Particules_portail_dark.png
├── cercles_elementaires/
│   ├── Cercle_feu.png
│   ├── Cercle_eau.png
│   ├── Cercle_terre.png
│   ├── Cercle_vent.png
│   ├── Cercle_light.png
│   └── Cercle_dark.png
└── glyphes/
    ├── divine/
    └── dark/
```

---

## 🚀 Prochaines étapes

- [ ] **Ajouter son ambiant** lors du hover/activation
- [ ] **Intégrer shaders WebGL** pour vortex ultra-réaliste
- [ ] **Particules avancées** avec physique (aspiration dynamique)
- [ ] **Réaction aux événements** (changement d'élément audio)
- [ ] **Animations de transition** vers page Gacha
- [ ] **Mobile optimizations** (touch events, orientations)
- [ ] **Analytics** (click tracking, element distribution)

---

**Build Date** : Janvier 2026  
**Version** : 1.0 - Production Ready  
**Status** : ✅ Prêt pour intégration Gacha
