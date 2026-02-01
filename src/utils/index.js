/**
 * Portal Utilities - Index/Barrel Export
 * Centralizes all Portal-related utilities and helpers
 */

export {
  PortalParticleSystem,
  PortalSoundManager,
  PortalEasing,
  createElementMorphAnimation,
  PortalCapabilities,
  PortalStateMachine,
} from "./portalUtils";

export {
  GLYPH_DEFINITIONS,
  ELEMENT_CIRCLE_DEFINITIONS,
  GlyphSVG,
  ElementCircleSVG,
  generateGlyph,
  allGlyphVariations,
} from "./portalGlyphs";

// Re-export Portal component
export { default as Portal } from "../components/Portal";

// Re-export examples
export * from "../components/PortalExamples";

// Re-export debug tools
export * from "../components/PortalDebug";

/**
 * Constants & Configurations
 */
export const PORTAL_CONFIG = {
  // States
  STATES: {
    IDLE: "idle",
    HOVER: "hover",
    ACTIVATING: "activating",
    ACTIVE: "active",
  },

  // Themes
  THEMES: {
    DIVINE: "divine",
    DARK: "dark",
  },

  // Elements
  ELEMENTS: {
    FEU: "feu",
    EAU: "eau",
    TERRE: "terre",
    VENT: "vent",
    LUMIERE: "lumiere",
    DARKNESS: "darkness",
  },

  // Animation Durations (ms)
  DURATIONS: {
    RING_IDLE: 4000,
    RING_HOVER: 3000,
    RING_ACTIVATE: 600,
    GLYPHES_IDLE: 12000,
    GLYPHES_HOVER: 8000,
    GLYPHES_ACTIVATE: 800,
    VORTEX_IDLE: 8000,
    VORTEX_HOVER: 5000,
    VORTEX_ACTIVATE: 2000,
    ELEMENT_BREATHE_IDLE: 3000,
    ELEMENT_BREATHE_HOVER: 2000,
    ELEMENT_MORPH: 600,
    ELEMENT_SWITCH: 6000, // How often element changes
    PARTICLE_SPAWN: 150, // Spawn interval
    PARTICLE_FLOAT: 2000,
    ACTIVATION_TOTAL: 1200, // Total activation duration
  },

  // Sizes
  SIZES: {
    CONTAINER: 300,
    RING_PERCENT: 100,
    GLYPHES_PERCENT: 80,
    ELEMENT_PERCENT: 50,
    VORTEX_PERCENT: 35,
    GLYPH_SIZE: 20,
  },

  // Limits
  LIMITS: {
    MAX_PARTICLES: 40,
    MIN_PARTICLE_SIZE: 2,
    MAX_PARTICLE_SIZE: 6,
    NUM_GLYPHES: 8,
    GLYPH_ANGLES: 45, // degrees between glyphes
  },

  // Colors (for reference)
  COLORS: {
    DIVINE: {
      PRIMARY: "#e8d5b7",
      ACCENT: "#ffd700",
      GLOW: "rgba(255, 223, 0, 0.8)",
      PARTICLE: "#ffeb99",
      VORTEX_GLOW: "rgba(255, 200, 100, 0.6)",
    },
    DARK: {
      PRIMARY: "#2a2a2a",
      ACCENT: "#cc2222",
      GLOW: "rgba(255, 50, 50, 0.9)",
      PARTICLE: "#ff6b6b",
      VORTEX_GLOW: "rgba(200, 0, 0, 0.7)",
    },
  },

  // Asset Paths
  ASSETS: {
    ANNEAU_DIVINE: "/assets/portail/Anneau_portail_divine.png",
    ANNEAU_DARK: "/assets/portail/Anneau_portail_dark.png",
    VORTEX_DIVINE: "/assets/portail/Vortex_portail_divine.png",
    VORTEX_DARK: "/assets/portail/Vortex_portail_dark.png",
    ELEMENTS_PATH: "/assets/portail/cercles_elementaires/",
    GLYPHES_PATH: "/assets/portail/glyphes/",
  },
};

/**
 * Helper function - Get all config for an element
 */
export const getElementConfig = (element) => {
  return {
    image: `${PORTAL_CONFIG.ASSETS.ELEMENTS_PATH}Cercle_${element}.png`,
    key: element,
    displayName: {
      feu: "🔥 Feu",
      eau: "💧 Eau",
      terre: "🌍 Terre",
      vent: "🌪️ Vent",
      lumiere: "☀️ Lumière",
      darkness: "🌑 Obscurité",
    }[element],
  };
};

/**
 * Helper function - Get theme-specific colors
 */
export const getThemeColors = (theme) => {
  return PORTAL_CONFIG.COLORS[theme === "divine" ? "DIVINE" : "DARK"];
};

/**
 * Helper function - Format duration for readability
 */
export const formatDuration = (ms) => {
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Helper function - Validate state transition
 */
export const isValidStateTransition = (from, to) => {
  const transitions = {
    idle: ["hover", "activating"],
    hover: ["idle", "activating"],
    activating: ["active"],
    active: ["idle"],
  };
  return transitions[from]?.includes(to) || false;
};

/**
 * Helper function - Get random element
 */
export const getRandomElement = () => {
  const elements = Object.values(PORTAL_CONFIG.ELEMENTS);
  return elements[Math.floor(Math.random() * elements.length)];
};

/**
 * Helper function - Merge Portal props with defaults
 */
export const getDefaultPortalProps = (overrides = {}) => {
  return {
    onInvoke: () => console.log("Portal invoked"),
    isLoading: false,
    ...overrides,
  };
};

/**
 * Development mode utilities
 */
export const PortalDev = {
  // Enable verbose logging
  verbose: false,

  log: (message, data) => {
    if (PortalDev.verbose) {
      console.log(`[Portal] ${message}`, data);
    }
  },

  // Get current performance metrics
  getMetrics: () => {
    const perf = performance.getEntriesByType("paint");
    return {
      paints: perf,
      memory: performance.memory
        ? {
            used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
            limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2),
          }
        : null,
    };
  },

  // Simulate state transitions
  simulateInteraction: async (duration = 2000) => {
    const states = ["idle", "hover", "activating", "active", "idle"];
    for (const state of states) {
      PortalDev.log(`State transition: ${state}`);
      await new Promise((resolve) =>
        setTimeout(resolve, duration / states.length),
      );
    }
  },

  // List all available utilities
  listUtilities: () => {
    return {
      components: [
        "Portal",
        "PortalTestSuite",
        "PortalDebug",
        "PortalExamples",
      ],
      utilities: [
        "PortalParticleSystem",
        "PortalSoundManager",
        "PortalStateMachine",
      ],
      config: ["PORTAL_CONFIG", "getElementConfig", "getThemeColors"],
    };
  },
};

export default {
  PORTAL_CONFIG,
  getElementConfig,
  getThemeColors,
  formatDuration,
  isValidStateTransition,
  getRandomElement,
  getDefaultPortalProps,
  PortalDev,
};
