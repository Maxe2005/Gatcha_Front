import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Portal.css';

const Portal = ({ onInvoke, isLoading = false, transitioning = false }) => {
    const { theme } = useTheme();
    const [state, setState] = useState('idle'); // idle, hover, activating, active
    const [activeElement, setActiveElement] = useState('feu'); // feu, eau, terre, vent, lumiere, darkness
    const [particles, setParticles] = useState([]);
    const [glyphRotation, setGlyphRotation] = useState(0);
    const portalRef = useRef(null);
    const particleSystemRef = useRef(null);
    const hoverTimestampRef = useRef(null);
    const lastFrameTimeRef = useRef(Date.now());
    const HOVER_MIN_DURATION = 3000; // 3 secondes en millisecondes

    // Éléments disponibles
    const elements = ['feu', 'eau', 'terre', 'vent', 'lumiere', 'darkness'];

    // Animation fluide de rotation des glyphes (accumulation continue)
    useEffect(() => {
        let animationFrameId;
        lastFrameTimeRef.current = Date.now();

        const updateRotation = () => {
            const now = Date.now();
            const deltaTime = now - lastFrameTimeRef.current;
            lastFrameTimeRef.current = now;

            // Vitesse en degrés par milliseconde
            // idle: 360°/12000ms = 0.03°/ms
            // hover: 360°/8000ms = 0.045°/ms
            // activating: 360°/2000ms = 0.18°/ms
            const speedMultiplier = state === 'hover' ? 1.5 : state === 'activating' ? 6 : 1;
            const speed = 0.03 * speedMultiplier; // degrees per ms
            
            setGlyphRotation((prev) => (prev + speed * deltaTime) % 360);
            animationFrameId = requestAnimationFrame(updateRotation);
        };

        animationFrameId = requestAnimationFrame(updateRotation);
        return () => cancelAnimationFrame(animationFrameId);
    }, [state, transitioning]);

    // Génération des particules (changer aléatoirement l'élément actif)
    useEffect(() => {
        const elementInterval = setInterval(() => {
            setActiveElement(elements[Math.floor(Math.random() * elements.length)]);
        }, 6000); // Changement tous les 6s

        return () => clearInterval(elementInterval);
    }, []);

    // Système de particules
    useEffect(() => {
        const particleInterval = setInterval(() => {
            if (!transitioning && (state === 'idle' || state === 'hover')) {
                const newParticle = {
                    id: Math.random(),
                    x: Math.cos(Math.random() * Math.PI * 2) * 120 + 50,
                    y: Math.sin(Math.random() * Math.PI * 2) * 120 + 50,
                    duration: 2 + Math.random() * 1,
                    size: 2 + Math.random() * 4,
                    delay: 0,
                };
                setParticles((prev) => {
                    const updated = [...prev, newParticle];
                    return updated.length > 40 ? updated.slice(-40) : updated;
                });
            }
        }, 150);

        return () => clearInterval(particleInterval);
    }, [state, transitioning]);

    const handleMouseEnter = () => {
        if (!isLoading) {
            setState('hover');
            hoverTimestampRef.current = Date.now();
        }
    };

    const handleMouseLeave = () => {
        if (!isLoading && state === 'hover') {
            const elapsedTime = Date.now() - (hoverTimestampRef.current || Date.now());
            
            if (elapsedTime < HOVER_MIN_DURATION) {
                // Pas assez de temps écoulé, attendre avant de revenir à idle
                const remainingTime = HOVER_MIN_DURATION - elapsedTime;
                setTimeout(() => {
                    setState('idle');
                    hoverTimestampRef.current = null;
                }, remainingTime);
            } else {
                // Assez de temps écoulé, revenir à idle immédiatement
                setState('idle');
                hoverTimestampRef.current = null;
            }
        }
    };

    const handleClick = () => {
        if (!isLoading && !transitioning && state !== 'activating' && state !== 'active') {
            setState('activating');
            // Animation d'activation
            setTimeout(() => {
                setState('active');
                if (onInvoke) onInvoke(activeElement);
                // Retour à idle après invocation
                setTimeout(() => {
                    setState('idle');
                }, 1200);
            }, 600);
        }
    };

    const elementToCircle = {
        feu: 'Cercle_feu.png',
        eau: 'Cercle_eau.png',
        terre: 'Cercle_terre.png',
        vent: 'Cercle_vent.png',
        lumiere: 'Cercle_light.png',
        darkness: 'Cercle_dark.png',
    };

    return (
        <div
            ref={portalRef}
            className={`portal-container ${theme} ${state} ${transitioning ? 'transitioning' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label="Portal d'invocation - Cliquez pour invoquer"
        >
            {/* COUCHE E : Particules & FX */}
            <div className="portal-layer particles-layer">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className={`particle ${theme}`}
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animation: `float-to-center ${particle.duration}s ease-in forwards`,
                            animationDelay: `${particle.delay}ms`,
                        }}
                    />
                ))}
            </div>

            {/* COUCHE D : Noyau / Vortex */}
            <div className="portal-layer vortex-layer">
                <div className={`vortex vortex-${theme}`}>
                    <img
                        src={`/assets/portail/Vortex_portail_${theme}.png`}
                        alt="Vortex"
                        className="vortex-image"
                    />
                    <div className="vortex-glow"></div>
                    {state === 'activating' && <div className="vortex-pulse"></div>}
                </div>
            </div>

            {/* COUCHE C : Cercle élémentaire */}
            <div className="portal-layer element-circle-layer">
                <div className={`element-circle element-${activeElement}`}>
                    {/* <img
                        src={`/assets/portail/cercles_elementaires/${elementToCircle[activeElement]}`}
                        alt={`Élément: ${activeElement}`}
                        className="element-image"
                    /> */}
                    {state === 'hover' && <div className="element-ripple"></div>}
                </div>
            </div>

            {/* COUCHE B : Glyphes & Runes */}
            <div className="portal-layer glyphes-layer">
                <div className={`glyphes-container glyphes-${theme}`}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                        <div
                            key={`glyph-${index}`}
                            className="glyph"
                            style={{
                                '--glyph-index': index,
                                transform: `rotate(${glyphRotation + (index * 45)}deg)`,
                            }}
                        >
                            <div className="glyph-inner">
                                <img
                                    src={`/assets/portail/glyphes/${theme}/Glyphes_${theme}_${index + 1}.png`}
                                    alt={`Glyphe ${index + 1}`}
                                    className="glyph-image"
                                />
                                {state !== 'idle' && (
                                    <div className="glyph-glow"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* COUCHE A : Anneau externe */}
            <div className="portal-layer ring-layer">
                <div className={`ring ring-${theme}`}>
                    <img
                        src={`/assets/portail/Anneau_portail_${theme}.png`}
                        alt="Anneau du portail"
                        className="ring-image"
                    />
                    {state === 'activating' && (
                        <div className="ring-flash"></div>
                    )}
                </div>
            </div>

            {/* Overlay pour le blackout d'activation */}
            {state === 'activating' && (
                <div className="activation-overlay">
                    <div className="blackout-flash"></div>
                </div>
            )}

            {/* Indicateur de chargement */}
            {isLoading && (
                <div className="portal-loading">
                    <div className="loading-ring"></div>
                </div>
            )}
        </div>
    );
};

export default Portal;
