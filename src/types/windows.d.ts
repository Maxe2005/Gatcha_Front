declare global {
  interface Window {
    triggerParticleTransition?: (done?: () => void) => void;
  }
}

export {};
