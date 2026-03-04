/**
 * Advanced Portal Animations & Utilities
 * Optional utilities for enhanced Portal effects
 */

/**
 * Génère un système de particules plus avancé
 * avec physique d'aspiration vers le centre
 */
export class PortalParticleSystem {
  container: HTMLElement;
  particles: any[];
  gravity: number;
  attractorStrength: number;
  maxParticles: number;

  constructor(container: HTMLElement) {
    this.container = container;
    this.particles = [];
    this.gravity = 0.1;
    this.attractorStrength = 0.05;
    this.maxParticles = 40;
  }

  create(
    x: number,
    y: number,
    vx: number = 0,
    vy: number = 0,
    size: number = 3
  ) {
    if (this.particles.length < this.maxParticles) {
      const particle = {
        x,
        y,
        vx,
        vy,
        size,
        age: 0,
        maxAge: 120, // frames
        element: document.createElement('div'),
      };

      particle.element.className = 'advanced-particle';
      particle.element.style.position = 'absolute';
      particle.element.style.width = `${size}px`;
      particle.element.style.height = `${size}px`;
      particle.element.style.borderRadius = '50%';
      particle.element.style.pointerEvents = 'none';

      this.container.appendChild(particle.element);
      this.particles.push(particle);

      return particle;
    }
  }

  update() {
    const centerX = this.container.offsetWidth / 2;
    const centerY = this.container.offsetHeight / 2;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Attraction vers le centre (vortex)
      const dx = centerX - p.x;
      const dy = centerY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 10) {
        const forceX = (dx / distance) * this.attractorStrength;
        const forceY = (dy / distance) * this.attractorStrength;
        p.vx += forceX;
        p.vy += forceY;
      }

      // Gravity (slight downward pull)
      p.vy += this.gravity * 0.01;

      // Friction
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Position update
      p.x += p.vx;
      p.y += p.vy;

      // Age & fade
      p.age += 1;
      const alpha = Math.max(0, 1 - p.age / p.maxAge);

      // Visual update
      p.element.style.left = `${p.x}px`;
      p.element.style.top = `${p.y}px`;
      p.element.style.opacity = alpha;
      p.element.style.transform = `scale(${1 - p.age / p.maxAge})`;

      // Remove dead particles
      if (p.age > p.maxAge) {
        p.element.remove();
        this.particles.splice(i, 1);
      }
    }
  }

  burst(x: number, y: number, count: number = 20, intensity: number = 2) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * intensity;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 3;

      this.create(x, y, vx, vy, size);
    }
  }

  clear() {
    this.particles.forEach((p) => p.element.remove());
    this.particles = [];
  }
}

/**
 * Gère les événements sonores du portail
 */
export class PortalSoundManager {
  sounds: {
    hover: HTMLAudioElement | null;
    activate: HTMLAudioElement | null;
    ambient: HTMLAudioElement | null;
  };
  isInitialized: boolean;

  constructor() {
    this.sounds = {
      hover: null,
      activate: null,
      ambient: null,
    };
    this.isInitialized = false;
  }

  init(soundAssets = {}) {
    // soundAssets = { hover: '/sounds/portal-hover.mp3', ... }
    Object.keys(this.sounds).forEach((key) => {
      if (soundAssets[key]) {
        const audio = new Audio(soundAssets[key]);
        audio.volume = 0.3;
        this.sounds[key] = audio;
      }
    });
    this.isInitialized = true;
  }

  play(soundType: keyof PortalSoundManager['sounds'], loop = false) {
    if (this.isInitialized && this.sounds[soundType]) {
      this.sounds[soundType].loop = loop;
      this.sounds[soundType].currentTime = 0;
      this.sounds[soundType].play().catch(() => {
        // Audio autoplay policy restriction
      });
    }
  }

  stop(soundType: keyof PortalSoundManager['sounds']) {
    if (this.isInitialized && this.sounds[soundType]) {
      this.sounds[soundType].pause();
    }
  }
}

/**
 * Animations spécialisées et éasing functions
 */
export const PortalEasing = {
  // Easing pour burst d'activation
  easeOutQuad: (t) => 1 - Math.pow(1 - t, 2),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * (t - 2)) * (2 * (t - 2)) + 1,

  // Easing pour respiration
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Easing pour élastique (spring)
  easeOutElastic: (t) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * c5) + 1;
  },
};

/**
 * Helper pour créer une animation de morphing d'éléments
 */
export function createElementMorphAnimation(
  fromElement: HTMLElement,
  toElement: HTMLElement,
  duration = 600
) {
  const startTime = Date.now();
  const startOpacity = parseFloat(getComputedStyle(fromElement).opacity);
  const startScale = 1;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = PortalEasing.easeInOutCubic(progress);

    // Fade out + scale from element
    fromElement.style.opacity = String(startOpacity * (1 - easeProgress));
    fromElement.style.transform = `scale(${startScale - easeProgress * 0.2})`;

    // Fade in + scale to element
    toElement.style.opacity = String(easeProgress);
    toElement.style.transform = `scale(${0.8 + easeProgress * 0.2})`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  animate();
}

/**
 * Détecte les capabilities du navigateur pour optimisations
 */
export const PortalCapabilities = {
  supportsWebGL: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  },

  supportsWebGPU: async () => {
    return !!(navigator as any).gpu;
  },

  supportsBackdropFilter: () => {
    const el = document.createElement('div');
    el.style.backdropFilter = 'blur(1px)';
    return el.style.backdropFilter !== '';
  },

  supportsWillChange: () => {
    const el = document.createElement('div');
    el.style.willChange = 'transform';
    return el.style.willChange !== '';
  },

  // GPU acceleration support check
  canAccelerate: () => {
    return (
      PortalCapabilities.supportsBackdropFilter() &&
      PortalCapabilities.supportsWillChange()
    );
  },
};

/**
 * Gestion des états du portail avec state machine
 */
export class PortalStateMachine {
  state: string;
  transitions: Record<string, string[]>;
  callbacks: Record<string, (prevState: string) => void>;

  constructor() {
    this.state = 'idle';
    this.transitions = {
      idle: ['hover', 'activating'],
      hover: ['idle', 'activating'],
      activating: ['active'],
      active: ['idle'],
    };
    this.callbacks = {};
  }

  transition(nextState: string) {
    if (this.transitions[this.state]?.includes(nextState)) {
      const previousState = this.state;
      this.state = nextState;

      if (this.callbacks[nextState]) {
        this.callbacks[nextState](previousState);
      }

      return true;
    }
    return false;
  }

  on(state: string, callback: (prevState: string) => void) {
    this.callbacks[state] = callback;
  }

  getState() {
    return this.state;
  }
}

export default {
  PortalParticleSystem,
  PortalSoundManager,
  PortalEasing,
  createElementMorphAnimation,
  PortalCapabilities,
  PortalStateMachine,
};
