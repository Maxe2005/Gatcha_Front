/**
 * Portal Component Usage Examples & Variations
 * Démonstration des différentes façons d'utiliser le composant Portal
 */

import React, { useState, useRef, useEffect } from 'react';
import Portal from '../components/Portal';
import {
    PortalParticleSystem,
    PortalStateMachine,
} from '../utils/portalUtils';

/**
 * ✅ USAGE 1: Basic Implementation (what Home.jsx uses)
 */
export const BasicPortalUsage = () => {
    const handleInvoke = (element) => {
        console.log(`🔥 Invoked element: ${element}`);
        // Navigate to Gacha page or trigger animation
    };

    return (
        <Portal 
            onInvoke={handleInvoke}
            isLoading={false}
        />
    );
};

/**
 * ✅ USAGE 2: Portal with Loading State
 * Utile lors d'une requête API
 */
export const PortalWithLoading = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleInvoke = async (element) => {
        setIsLoading(true);
        try {
            // Simulate API call
            const response = await fetch(`/api/gacha/${element}`);
            const data = await response.json();
            console.log('Gacha result:', data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Portal 
            onInvoke={handleInvoke}
            isLoading={isLoading}
        />
    );
};

/**
 * ✅ USAGE 3: Portal with Advanced Particle System
 * Pour des effets visuels plus spectaculaires
 */
export const PortalWithAdvancedParticles = () => {
    const portalRef = useRef(null);
    const particleSystemRef = useRef(null);

    useEffect(() => {
        if (portalRef.current && !particleSystemRef.current) {
            particleSystemRef.current = new PortalParticleSystem(portalRef.current);
        }

        const animationFrame = setInterval(() => {
            if (particleSystemRef.current) {
                particleSystemRef.current.update();
            }
        }, 1000 / 60); // 60fps

        return () => clearInterval(animationFrame);
    }, []);

    const handleInvoke = (element) => {
        // Burst effect à l'activation
        if (particleSystemRef.current) {
            particleSystemRef.current.burst(
                portalRef.current.offsetWidth / 2,
                portalRef.current.offsetHeight / 2,
                50,
                3
            );
        }
        console.log(`Invoked: ${element}`);
    };

    return (
        <div ref={portalRef} style={{ position: 'relative', width: '300px', height: '300px' }}>
            <Portal 
                onInvoke={handleInvoke}
                isLoading={false}
            />
        </div>
    );
};

/**
 * ✅ USAGE 4: Portal with State Machine & Analytics
 * Suivi détaillé des interactions
 */
export const PortalWithAnalytics = () => {
    const stateMachineRef = useRef(new PortalStateMachine());
    const [analyticsData, setAnalyticsData] = useState({
        hovers: 0,
        invocations: 0,
        lastElement: null,
    });

    useEffect(() => {
        const sm = stateMachineRef.current;

        // Track state transitions
        sm.on('hover', () => {
            setAnalyticsData((prev) => ({
                ...prev,
                hovers: prev.hovers + 1,
            }));
        });

        sm.on('active', () => {
            // Send analytics to server
            console.log('📊 Analytics:', analyticsData);
        });
    }, []);

    const handleInvoke = (element) => {
        setAnalyticsData((prev) => ({
            ...prev,
            invocations: prev.invocations + 1,
            lastElement: element,
        }));
        console.log(`✨ Invoked: ${element}`);
    };

    return (
        <div>
            <Portal 
                onInvoke={handleInvoke}
                isLoading={false}
            />
            {/* Debug panel */}
            <div style={{
                marginTop: '20px',
                padding: '10px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                color: 'white',
            }}>
                <p>Hovers: {analyticsData.hovers}</p>
                <p>Invocations: {analyticsData.invocations}</p>
                <p>Last Element: {analyticsData.lastElement || 'None'}</p>
            </div>
        </div>
    );
};

/**
 * ✅ USAGE 5: Portal in Modal / Overlay
 * Utile pour les pop-ups d'invocation premium
 */
export const PortalInModal = () => {
    const [showModal, setShowModal] = useState(false);

    const handleInvoke = (element) => {
        console.log(`🎁 Premium invocation: ${element}`);
        setShowModal(false);
        // Trigger special animation
    };

    return (
        <div>
            <button onClick={() => setShowModal(true)}>
                🎫 Invocation Premium
            </button>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: '#1a1a1a',
                        borderRadius: '20px',
                        padding: '40px',
                        textAlign: 'center',
                    }}>
                        <h2>Invocation Spéciale</h2>
                        <Portal 
                            onInvoke={handleInvoke}
                            isLoading={false}
                        />
                        <button 
                            onClick={() => setShowModal(false)}
                            style={{ marginTop: '20px' }}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * ✅ USAGE 6: Multiple Portals (Boss Battle Preview)
 * Démontre que plusieurs portals peuvent coexister
 */
export const MultiplePortals = () => {
    const elementTypes = ['feu', 'eau', 'terre'];

    return (
        <div style={{
            display: 'flex',
            gap: '40px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
        }}>
            {elementTypes.map((element) => (
                <div key={element} style={{ textAlign: 'center' }}>
                    <h3>Type: {element}</h3>
                    <Portal 
                        onInvoke={(invokedElement) => {
                            console.log(`${element} invoked: ${invokedElement}`);
                        }}
                        isLoading={false}
                    />
                </div>
            ))}
        </div>
    );
};

/**
 * ✅ USAGE 7: Portal with Custom Callback Chain
 * Pour des interactions plus complexes
 */
export const PortalWithCallbackChain = () => {
    const callbacks = {
        onBeforeInvoke: (element) => {
            console.log(`⏳ Pre-invocation: ${element}`);
            // Validate player resources, check cooldowns, etc.
        },
        onInvoke: (element) => {
            console.log(`🎪 Invoking: ${element}`);
            // Main invocation logic
        },
        onAfterInvoke: (element, result) => {
            console.log(`✅ Post-invocation: ${element}`, result);
            // Show rewards, update UI, etc.
        },
        onError: (error) => {
            console.error(`❌ Invocation error:`, error);
        },
    };

    const handleInvoke = async (element) => {
        try {
            callbacks.onBeforeInvoke(element);

            // Simulated async operation
            const result = await new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, reward: '⭐ 5-star' });
                }, 1500);
            });

            callbacks.onInvoke(element);
            callbacks.onAfterInvoke(element, result);
        } catch (error) {
            callbacks.onError(error);
        }
    };

    return (
        <Portal 
            onInvoke={handleInvoke}
            isLoading={false}
        />
    );
};

/**
 * ✅ USAGE 8: Theme-Responsive Portal
 * Démontre la réactivité au changement de thème
 */
export const ThemeResponsivePortal = () => {
    const { theme, toggleTheme } = useTheme?.() || { theme: 'divine' };

    return (
        <div>
            <button onClick={toggleTheme} style={{ marginBottom: '20px' }}>
                🌙 Toggle Theme ({theme})
            </button>
            <Portal 
                onInvoke={(element) => {
                    console.log(`[${theme}] Invoked: ${element}`);
                }}
                isLoading={false}
            />
        </div>
    );
};

/**
 * ✅ USAGE 9: Portal with Keyboard Support
 * Ajoute la possibilité d'invoquer au clavier
 */
export const PortalWithKeyboardSupport = () => {
    const portalRef = useRef(null);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.code === 'Space' || event.code === 'Enter') {
                event.preventDefault();
                // Trigger portal click programmatically
                portalRef.current?.click?.();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div ref={portalRef}>
            <Portal 
                onInvoke={(element) => {
                    console.log(`🎹 Keyboard invocation: ${element}`);
                }}
                isLoading={false}
            />
            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem' }}>
                Press Space or Enter to invoke
            </p>
        </div>
    );
};

/**
 * ✅ USAGE 10: Portal with Pity Counter
 * Système de "guaranteed" à X tirages
 */
export const PortalWithPitySystem = () => {
    const [pityCounter, setPityCounter] = useState(0);
    const PITY_THRESHOLD = 10;

    const handleInvoke = (element) => {
        setPityCounter((prev) => {
            const next = prev + 1;
            if (next >= PITY_THRESHOLD) {
                console.log('🌟 GUARANTEED PULL!');
                setPityCounter(0);
                return 0;
            }
            return next;
        });
        console.log(`Pull: ${pityCounter + 1}/${PITY_THRESHOLD}`);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Portal 
                onInvoke={handleInvoke}
                isLoading={false}
            />
            <div style={{
                marginTop: '20px',
                padding: '10px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                color: pityCounter >= PITY_THRESHOLD - 2 ? '#ffd700' : 'white',
            }}>
                <p>Pity Counter: {pityCounter}/{PITY_THRESHOLD}</p>
                {pityCounter >= PITY_THRESHOLD - 2 && (
                    <p>⚠️ Prochain tirage garanti!</p>
                )}
            </div>
        </div>
    );
};

export default {
    BasicPortalUsage,
    PortalWithLoading,
    PortalWithAdvancedParticles,
    PortalWithAnalytics,
    PortalInModal,
    MultiplePortals,
    PortalWithCallbackChain,
    ThemeResponsivePortal,
    PortalWithKeyboardSupport,
    PortalWithPitySystem,
};
