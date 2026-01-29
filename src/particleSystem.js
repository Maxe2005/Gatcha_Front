/**
 * Particle Click & Trail System
 * Génère des particules sur clic ET en traînée continue
 * S'adapte au thème actif (divine ou dark)
 */

class ClickParticle {
  constructor(x, y, isDark, isTrail = false) {
    this.x = x;
    this.y = y;
    this.isDark = isDark;
    this.isTrail = isTrail;
    this.time = 0; // Pour les oscillations

    // Propriétés de base
    this.size = isTrail ? Math.random() * 3 + 1 : Math.random() * 5 + 2;
    this.opacity = 1;
    this.life = 1;

    if (isDark) {
      if (isTrail) {
        // Mode Dark Trail: sillage de sang qui tombe
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = Math.random() * 2; // Tombe vers le bas
        this.color = Math.random() > 0.3 ? "#C0392B" : "#641E16";
        this.decay = 0.02;
        this.gravity = 0.4; // Gravité plus forte
      } else {
        // Mode Dark Click: éclaboussure brutale
        this.speedX = (Math.random() - 0.5) * 10;
        this.speedY = (Math.random() - 0.5) * 10 - 2;
        this.color = Math.random() > 0.5 ? "#922B21" : "#5B2C6F";
        this.decay = 0.03;
        this.gravity = 0.3;
      }
    } else {
      if (isTrail) {
        // Mode Divine Trail: poussière d'étoile vaporeuse
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3 - 1; // Monte légèrement
        this.color = Math.random() > 0.3 ? "#FFF176" : "#FFFFFF";
        this.decay = 0.015; // Plus lent
        this.gravity = -0.05; // Flotte vers le haut
        this.oscillation = Math.random() * 0.1 + 0.05; // Pour l'effet vaporeux
      } else {
        // Mode Divine Click: flottement léger
        this.speedX = (Math.random() - 0.5) * 6;
        this.speedY = (Math.random() - 0.5) * 6 - 3;
        this.color = Math.random() > 0.5 ? "#F1C40F" : "#FFFFFF";
        this.decay = 0.025;
        this.gravity = 0.1;
      }
    }
  }

  update() {
    this.time += 0.1;

    // Oscillation pour le mode divine trail
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

  draw(ctx) {
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
      // Mode Divine: petits carrés/paillettes
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.isTrail ? 25 : 15;
      const offset = this.size / 2;
      ctx.fillRect(
        this.x - offset,
        this.y - offset,
        this.size * 2,
        this.size * 2,
      );
    }

    ctx.shadowBlur = 0; // Réinitialiser
  }
}

class ParticleSystem {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.isDrawing = false; // État pour le mode "drawing"

    // Configuration du canvas
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "9999";

    document.body.appendChild(this.canvas);

    // Redimensionner le canvas
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Écouter les événements de souris
    window.addEventListener("mousedown", (e) => this.onMouseDown(e));
    window.addEventListener("mouseup", () => this.onMouseUp());
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));

    // Démarrer l'animation
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  onMouseDown(event) {
    this.isDrawing = true;
    const isDark = document.body.classList.contains("theme-dark");

    // Générer 15 particules pour le clic initial
    for (let i = 0; i < 15; i++) {
      this.particles.push(
        new ClickParticle(event.clientX, event.clientY, isDark, false),
      );
    }
  }

  onMouseUp() {
    this.isDrawing = false;
  }

  onMouseMove(event) {
    if (!this.isDrawing) return;

    const isDark = document.body.classList.contains("theme-dark");

    // Générer 3-4 particules pour la traînée (moins pour éviter la saturation)
    for (let i = 0; i < 3; i++) {
      this.particles.push(
        new ClickParticle(event.clientX, event.clientY, isDark, true),
      );
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Filtrer et mettre à jour les particules
    this.particles = this.particles.filter((p) => p.opacity > 0);

    this.particles.forEach((p) => {
      p.update();
      p.draw(this.ctx);
    });

    requestAnimationFrame(() => this.animate());
  }

  // Fonction pour déclencher la transition après authentification
  triggerTransition(onComplete) {
    this.isDrawing = false; // Arrêter les particules de souris
    const isDark = document.body.classList.contains("theme-dark");

    // Coordonnées du centre de l'écran
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Forcer toutes les particules à converger vers le centre
    this.particles.forEach((p) => {
      const dx = centerX - p.x;
      const dy = centerY - p.y;
      p.speedX = dx * 0.1;
      p.speedY = dy * 0.1;
      p.size *= 1.5; // Grossir en convergeant
      p.decay = 0.01; // Ralentir la disparition
    });

    // Créer ou réutiliser l'overlay de transition
    let overlay = document.getElementById("transition-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "transition-overlay";
      document.body.appendChild(overlay);
    }

    // Réinitialiser les classes
    overlay.className = "";
    overlay.style.opacity = ""; // Réinitialiser pour que CSS le contrôle

    // Phase 1: Animation de remplissage (1.5s) - opacity va de 0 à 1
    overlay.classList.add(isDark ? "void-effect" : "divine-flash");
    overlay.style.display = "block";
    overlay.style.pointerEvents = "auto"; // Bloquer les clics pendant la transition

    // Après 1.5s (fin de phase 1), appeler le callback pour charger la page Home
    setTimeout(() => {
      if (onComplete) onComplete();

      // Après un petit délai pour laisser React charger Home, commencer la phase 2
      setTimeout(() => {
        // Phase 2: Fade out de l'overlay (1s) - opacity va de 1 à 0
        overlay.classList.remove(isDark ? "void-effect" : "divine-flash");
        overlay.classList.add("reveal-transition");

        // Après la phase 2, nettoyer complètement
        setTimeout(() => {
          overlay.style.display = "none";
          overlay.style.opacity = "0";
          overlay.style.pointerEvents = "none";
          overlay.className = "";
        }, 1000);
      }, 100); // Petit délai pour que React ait commencé le rendu
    }, 1500);
  }
}

// Instance globale pour pouvoir appeler triggerTransition depuis n'importe où
let particleSystemInstance = null;

// Initialiser le système au chargement de la page
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    particleSystemInstance = new ParticleSystem();
  });
} else {
  particleSystemInstance = new ParticleSystem();
}

// Export de la fonction pour déclencher la transition
window.triggerParticleTransition = (onComplete) => {
  if (particleSystemInstance) {
    particleSystemInstance.triggerTransition(onComplete);
  }
};
