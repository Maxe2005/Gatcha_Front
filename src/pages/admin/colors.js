/**
 * Global color constants for Admin Monster Management
 * Centralized color definitions to maintain consistency and follow DRY principles
 *
 * This is the SINGLE SOURCE OF TRUTH for all colors.
 * CSS variables are generated from these values at runtime via injectColorsToCSS().
 */

// Les couleurs de rareté (COMMON/RARE/EPIC/LEGENDARY) ne sont plus définies
// ici : elles vivent dans les tokens --rank-* de src/index.css, palette fixe
// partagée avec GatchaCard/SkillCard/Inventory (voir CLAUDE.md > "Direction
// artistique & design system").

export const ELEMENT_COLORS = {
  fire: {
    light: '#ef4444',
    dark: '#f87171',
  },
  water: {
    light: '#0ea5e9',
    dark: '#38bdf8',
  },
  wind: {
    light: '#10b981',
    dark: '#34d399',
  },
  earth: {
    light: '#d97706',
    dark: '#fb923c',
  },
  light: {
    light: '#fbbf24',
    dark: '#fde047',
  },
  darkness: {
    light: '#6366f1',
    dark: '#818cf8',
  },
};

export const STATE_COLORS = {
  GENERATED: '#a0aec0',
  DEFECTIVE: '#e53e3e',
  PENDING_REVIEW: '#ecc94b',
  APPROVED: '#48bb78',
  TRANSMITTED: '#4299e1',
  REJECTED: '#ed8936',
};

export const STATE_TEXT_COLOR = {
  PENDING_REVIEW: '#000',
};

export const VALIDITY_COLORS = {
  VALID: '#48bb78',
  INVALID: '#e53e3e',
};

/**
 * Helper function to get color value based on current theme
 * @param {Object} colorVariants - Object with 'light' and 'dark' properties
 * @param {boolean} isDarkMode - Whether dark mode is active
 * @returns {string} The appropriate color hex value
 */
export const getThemeColor = (colorVariants, isDarkMode = false) => {
  return isDarkMode ? colorVariants.dark : colorVariants.light;
};

/**
 * Helper function to get element color
 * @param {string} element - The element name (fire, water, wind, earth, light, darkness)
 * @param {boolean} isDarkMode - Whether dark mode is active
 * @returns {string} The color hex value
 */
export const getElementColor = (element, isDarkMode = false) => {
  const elementColors = ELEMENT_COLORS[element];
  if (!elementColors) return '#000';
  return getThemeColor(elementColors, isDarkMode);
};

/**
 * Generate CSS variables from color constants
 * Injects CSS variables into the document root at runtime
 * This ensures a single source of truth for all colors
 */
export const injectColorsToCSS = () => {
  const root = document.documentElement;

  // Inject element colors
  Object.entries(ELEMENT_COLORS).forEach(([element, colors]) => {
    const varName = `--element-color-${element}`;
    const varNameDark = `--element-color-${element}-dark`;
    root.style.setProperty(varName, colors.light);
    root.style.setProperty(varNameDark, colors.dark);
  });

  // Inject state colors
  Object.entries(STATE_COLORS).forEach(([state, color]) => {
    const varName = `--state-color-${state.toLowerCase()}`;
    root.style.setProperty(varName, color);
  });

  // Inject state text colors
  Object.entries(STATE_TEXT_COLOR).forEach(([state, color]) => {
    const varName = `--state-color-${state.toLowerCase()}-text`;
    root.style.setProperty(varName, color);
  });

  // Inject validity colors
  Object.entries(VALIDITY_COLORS).forEach(([status, color]) => {
    const varName = `--color-${status.toLowerCase()}`;
    root.style.setProperty(varName, color);
  });
};
