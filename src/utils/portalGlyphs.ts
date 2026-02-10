/**
 * Portal Glyphes SVG - Versions alternatives pour customisation
 * Ces glyphes peuvent être utilisés comme fallback ou pour des variations
 */

export const GLYPH_DEFINITIONS = {
  // Glyphes Divine
  divine: [
    {
      id: 'glyph-divine-1',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#ffd700" stroke-width="2"/>
        <path d="M 50 20 L 60 35 L 50 50 L 40 35 Z" fill="#ffd700"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#ffd700" stroke-width="1"/>
      </svg>`,
    },
    {
      id: 'glyph-divine-2',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 50 20 L 70 40 L 80 50 L 70 60 L 50 80 L 30 60 L 20 50 L 30 40 Z" 
              fill="none" stroke="#ffd700" stroke-width="2"/>
        <circle cx="50" cy="50" r="8" fill="#ffd700"/>
      </svg>`,
    },
    {
      id: 'glyph-divine-3',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#ffd700" stroke-width="2"/>
        <line x1="50" y1="10" x2="50" y2="90" stroke="#ffd700" stroke-width="1"/>
        <line x1="10" y1="50" x2="90" y2="50" stroke="#ffd700" stroke-width="1"/>
        <line x1="25" y1="25" x2="75" y2="75" stroke="#ffd700" stroke-width="1"/>
        <line x1="75" y1="25" x2="25" y2="75" stroke="#ffd700" stroke-width="1"/>
      </svg>`,
    },
    {
      id: 'glyph-divine-4',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 70,30 70,70 50,90 30,70 30,30" 
                 fill="none" stroke="#ffd700" stroke-width="2"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="#ffd700" stroke-width="1.5"/>
      </svg>`,
    },
  ],

  // Glyphes Dark
  dark: [
    {
      id: 'glyph-dark-1',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#cc2222" stroke-width="2"/>
        <path d="M 50 30 L 65 50 L 50 70 L 35 50 Z" fill="#cc2222" opacity="0.8"/>
        <path d="M 50 50 L 60 60 L 50 70 L 40 60 Z" fill="#cc2222" opacity="0.5"/>
      </svg>`,
    },
    {
      id: 'glyph-dark-2',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 50 20 L 70 40 L 80 50 L 70 60 L 50 80 L 30 60 L 20 50 L 30 40 Z" 
              fill="none" stroke="#cc2222" stroke-width="2"/>
        <line x1="35" y1="35" x2="65" y2="65" stroke="#cc2222" stroke-width="1.5"/>
        <line x1="65" y1="35" x2="35" y2="65" stroke="#cc2222" stroke-width="1.5"/>
      </svg>`,
    },
    {
      id: 'glyph-dark-3',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#cc2222" stroke-width="2" stroke-dasharray="5,5"/>
        <path d="M 50 10 L 60 50 L 50 90 L 40 50 Z" fill="#cc2222" opacity="0.6"/>
      </svg>`,
    },
    {
      id: 'glyph-dark-4',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,15 75,40 75,60 50,85 25,60 25,40" 
                 fill="none" stroke="#cc2222" stroke-width="2"/>
        <polyline points="30,50 50,70 70,50" fill="none" stroke="#cc2222" stroke-width="1.5"/>
      </svg>`,
    },
  ],
};

/**
 * Component pour rendre les glyphes SVG
 */
export const GlyphSVG = ({ glyph, theme = 'divine' }) => {
  const glyphDef =
    GLYPH_DEFINITIONS[theme]?.[glyph] || GLYPH_DEFINITIONS[theme]?.[0];

  if (!glyphDef) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: glyphDef.svg }}
      style={{
        width: '100%',
        height: '100%',
        filter: `drop-shadow(0 0 8px ${theme === 'divine' ? 'rgba(255, 223, 0, 0.8)' : 'rgba(255, 50, 50, 0.9)'})`,
      }}
    />
  );
};

/**
 * Utilitaires pour générer les glyphes dynamiquement
 */
export const generateGlyph = (index, theme = 'divine') => {
  const glyphs = GLYPH_DEFINITIONS[theme];
  return glyphs[index % glyphs.length];
};

export const allGlyphVariations = () => {
  return {
    divine: GLYPH_DEFINITIONS.divine.length,
    dark: GLYPH_DEFINITIONS.dark.length,
  };
};

/**
 * Éléments élémentaires SVG (cercles)
 */
export const ELEMENT_CIRCLE_DEFINITIONS = {
  feu: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="fireGrad" cx="50%" cy="50%">
        <stop offset="0%" style="stop-color:#ff6b00;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff0000;stop-opacity:0.6" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#fireGrad)"/>
    <path d="M 50 10 Q 40 25 40 40 Q 40 60 50 70 Q 60 60 60 40 Q 60 25 50 10" 
          fill="none" stroke="#ffaa00" stroke-width="2" opacity="0.7"/>
  </svg>`,

  eau: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#00bbff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0066ff;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#waterGrad)"/>
    <path d="M 30 50 Q 40 40 50 50 T 70 50" fill="none" stroke="#00ffff" stroke-width="2" opacity="0.8"/>
    <path d="M 25 60 Q 40 50 55 60 T 75 60" fill="none" stroke="#00ffff" stroke-width="1.5" opacity="0.6"/>
  </svg>`,

  terre: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="earthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#8b6f47;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#5d4037;stop-opacity:0.8" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#earthGrad)"/>
    <rect x="25" y="35" width="20" height="20" fill="none" stroke="#d4af37" stroke-width="1.5" opacity="0.6"/>
    <rect x="55" y="50" width="15" height="15" fill="none" stroke="#d4af37" stroke-width="1.5" opacity="0.6"/>
  </svg>`,

  vent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="windGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#e0f7ff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#80deea;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#windGrad)"/>
    <path d="M 25 45 Q 50 35 75 45" fill="none" stroke="#00bcd4" stroke-width="2" opacity="0.8"/>
    <path d="M 20 55 Q 50 65 80 55" fill="none" stroke="#00bcd4" stroke-width="2" opacity="0.6"/>
  </svg>`,

  lumiere: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="lightGrad" cx="50%" cy="50%">
        <stop offset="0%" style="stop-color:#ffff99;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ffeb3b;stop-opacity:0.4" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#lightGrad)"/>
    <circle cx="50" cy="50" r="25" fill="none" stroke="#ffeb3b" stroke-width="1.5" opacity="0.8"/>
    <line x1="50" y1="10" x2="50" y2="25" stroke="#ffeb3b" stroke-width="2" opacity="0.7"/>
    <line x1="50" y1="75" x2="50" y2="90" stroke="#ffeb3b" stroke-width="2" opacity="0.7"/>
  </svg>`,

  darkness: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="darkGrad" cx="50%" cy="50%">
        <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#000000;stop-opacity:0.8" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#darkGrad)"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="#330000" stroke-width="2" opacity="0.6"/>
    <path d="M 35 50 Q 50 35 65 50 Q 50 65 35 50" fill="none" stroke="#660000" stroke-width="1.5" opacity="0.5"/>
  </svg>`,
};

/**
 * Component pour rendre les cercles élémentaires SVG
 */
export const ElementCircleSVG = ({ element }) => {
  const circleDef = ELEMENT_CIRCLE_DEFINITIONS[element];

  if (!circleDef) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: circleDef }}
      style={{
        width: '100%',
        height: '100%',
        animation: 'element-breathe 3s ease-in-out infinite',
      }}
    />
  );
};

export default {
  GLYPH_DEFINITIONS,
  ELEMENT_CIRCLE_DEFINITIONS,
  GlyphSVG,
  ElementCircleSVG,
  generateGlyph,
  allGlyphVariations,
};
