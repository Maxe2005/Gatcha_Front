// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Particule optimisée pour Canvas
 */
class CanvasParticle {
  x: number;
  y: number;
  isDark: boolean;
  isTrail: boolean;
  time: number;
  size: number;
  opacity: number;
  life: number;
  speedX: number;
  speedY: number;
  color: string;
  decay: number;
  gravity: number;
  oscillation?: number;

  constructor(x: number, y: number, isDark: boolean, isTrail = false) {
    this.x = x;
    this.y = y;
    this.isDark = isDark;
    this.isTrail = isTrail;
    this.time = 0;

    // Propriétés de base
    this.size = isTrail ? Math.random() * 3 + 1 : Math.random() * 5 + 2;
    this.opacity = 1;
    this.life = 1;

    if (isDark) {
      if (isTrail) {
        // Mode Dark Trail: sillage de sang
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = Math.random() * 2;
        this.color = Math.random() > 0.3 ? '#C0392B' : '#641E16';
        this.decay = 0.02;
        this.gravity = 0.4;
      } else {
        // Mode Dark Click: éclaboussure brutale
        this.speedX = (Math.random() - 0.5) * 10;
        this.speedY = (Math.random() - 0.5) * 10 - 2;
        this.color = Math.random() > 0.5 ? '#922B21' : '#5B2C6F';
        this.decay = 0.03;
        this.gravity = 0.3;
      }
    } else {
      if (isTrail) {
        // Mode Divine Trail: poussière d'étoile
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3 - 1;
        this.color = Math.random() > 0.3 ? '#FFF176' : '#FFFFFF';
        this.decay = 0.015;
        this.gravity = -0.05;
        this.oscillation = Math.random() * 0.1 + 0.05;
      } else {
        // Mode Divine Click: flottement léger
        this.speedX = (Math.random() - 0.5) * 6;
        this.speedY = (Math.random() - 0.5) * 6 - 3;
        this.color = Math.random() > 0.5 ? '#F1C40F' : '#FFFFFF';
        this.decay = 0.025;
        this.gravity = 0.1;
      }
    }
  }

  update() {
    this.time += 0.1;

    if (!this.isDark && this.isTrail) {
      this.x += this.speedX + Math.sin(this.time) * this.oscillation;
    } else {
      this.x += this.speedX;
    }

    this.y += this.speedY;
    this.speedY += this.gravity;
    this.life -= this.decay;
    this.opacity = Math.max(0, this.life);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.opacity <= 0) return;

    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    if (this.isDark) {
      // Mode Dark: cercles avec glow
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.isTrail ? 15 : 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Mode Divine: carrés avec glow
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.isTrail ? 20 : 15;
      ctx.fillRect(
        this.x - this.size / 2,
        this.y - this.size / 2,
        this.size,
        this.size
      );
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  isAlive() {
    return this.life > 0;
  }
}

/**
 * Particule ambiante : nait sur un cercle autour du centre et y converge
 * en rétrécissant/s'estompant (remplace l'ancien DOM + setInterval de Home)
 */
class AmbientParticle {
  startX: number;
  startY: number;
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  size: number;
  life: number;
  decay: number;
  color: string;
  glow: string;

  constructor(canvasWidth: number, canvasHeight: number, isDark: boolean) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.min(canvasWidth, canvasHeight) * 0.5;
    this.centerX = canvasWidth / 2;
    this.centerY = canvasHeight / 2;
    this.startX = this.centerX + Math.cos(angle) * radius;
    this.startY = this.centerY + Math.sin(angle) * radius;
    this.x = this.startX;
    this.y = this.startY;
    this.size = 2 + Math.random() * 4;
    this.life = 1;

    const durationSeconds = 2 + Math.random(); // 2-3s, ~60fps
    this.decay = 1 / (durationSeconds * 60);

    this.color = isDark ? '#ff6b6b' : '#ffeb99';
    this.glow = isDark ? 'rgba(255, 50, 50, 0.7)' : 'rgba(255, 200, 0, 0.6)';
  }

  update() {
    const progress = 1 - this.life;
    this.x = this.startX + (this.centerX - this.startX) * progress;
    this.y = this.startY + (this.centerY - this.startY) * progress;
    this.life -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.life <= 0) return;

    const scale = Math.max(0, this.life);
    const radius = (this.size / 2) * scale;
    if (radius <= 0) return;

    ctx.globalAlpha = Math.max(0, this.life * 0.8 + 0.2) * scale;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.glow;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  isAlive() {
    return this.life > 0;
  }
}

const MAX_AMBIENT_PARTICLES = 40;
const AMBIENT_SPAWN_INTERVAL_MS = 150;

/**
 * CanvasParticleSystem
 * Système de particules ultra-performant utilisant Canvas
 * Remplace le système DOM pour 3-4x plus de performance
 *
 * Deux modes :
 * - "interactive" (défaut) : particules générées au clic/survol de la souris
 *   (utilisé sur l'écran de chargement global).
 * - "ambient" : particules générées en continu, qui convergent vers le
 *   centre (utilisé en fond du portail de Home).
 *
 * Utilisation:
 * <CanvasParticleSystem theme={theme} />
 * <CanvasParticleSystem theme={theme} mode="ambient" paused={isTransitioning} />
 */
const CanvasParticleSystem = ({
  theme = 'divine',
  mode = 'interactive',
  paused = false,
}: {
  theme?: 'divine' | 'dark';
  mode?: 'interactive' | 'ambient';
  paused?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<(CanvasParticle | AmbientParticle)[]>([]);
  const animationRef = useRef<number | null>(null);
  const mouseTrailRef = useRef<{ x: number; y: number } | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const pausedRef = useRef(paused);

  const isDark = theme === 'dark';
  const isAmbient = mode === 'ambient';

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Initialiser le canvas au montage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Boucle d'animation optimisée
  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: true });

      // Effacer le canvas
      if (isAmbient) {
        // Fond ambiant : effacement complet, pas de traînée résiduelle
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (
          !pausedRef.current &&
          timestamp - lastSpawnRef.current >= AMBIENT_SPAWN_INTERVAL_MS
        ) {
          lastSpawnRef.current = timestamp;
          particlesRef.current.push(
            new AmbientParticle(canvas.width, canvas.height, isDark)
          );
          if (particlesRef.current.length > MAX_AMBIENT_PARTICLES) {
            particlesRef.current.splice(
              0,
              particlesRef.current.length - MAX_AMBIENT_PARTICLES
            );
          }
        }
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Trail effect léger
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Mettre à jour et dessiner les particules
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw(ctx);

        if (!particle.isAlive()) {
          particles.splice(i, 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [isAmbient, isDark]
  );

  // Démarrer l'animation
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Handler pour les clics
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Créer 15-25 particules par clic
      const particleCount = 20;
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new CanvasParticle(x, y, isDark, false));
      }
    },
    [isDark]
  );

  // Handler pour le trail sur mouvement
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Générer trail tous les 5px de mouvement pour éviter trop de particules
      if (mouseTrailRef.current) {
        const dx = x - mouseTrailRef.current.x;
        const dy = y - mouseTrailRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          particlesRef.current.push(new CanvasParticle(x, y, isDark, true));
          mouseTrailRef.current = { x, y };
        }
      } else {
        mouseTrailRef.current = { x, y };
      }
    },
    [isDark]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={isAmbient ? undefined : handleCanvasClick}
      onMouseMove={isAmbient ? undefined : handleMouseMove}
      style={{
        position: isAmbient ? 'absolute' : 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isAmbient ? 'none' : 'auto',
        zIndex: 1,
      }}
    />
  );
};

export default CanvasParticleSystem;
