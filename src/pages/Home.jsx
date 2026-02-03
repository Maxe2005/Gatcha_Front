import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import ThemeToggle from '../components/ThemeToggle';
import Portal from '../components/Portal';

const Home = () => {
    const { theme, toggleTheme } = useTheme();
    const { playerData, refreshPlayerData } = usePlayer();
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [particles, setParticles] = useState([]);
    

    // Simulation de chargement pour l'animation d'entrée
    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
        // Rafraîchir les données joueur à l'arrivée
        refreshPlayerData();
    }, []);

    // Placeholder pour les ressources (si non présentes dans l'API)
    // À remplacer par playerData.gold, playerData.gems quand disponibles
    const resources = {
        gold: playerData?.gold || 0,
        gems: playerData?.gems || 0,
        tickets: playerData?.tickets || 0
    };

    // Calcul de la progression XP (mock)
    const xpPercent = playerData ? (playerData.experience % 1000) / 10 : 0;

    const handlePortalInvoke = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            navigate('/gacha');
        }, 2050); // Durée totale de la warp animation
    };
    
        // Système de particules
        useEffect(() => {
            const particleInterval = setInterval(() => {
                if (!isTransitioning) {
                    const newParticle = {
                        id: Math.random(),
                        x: Math.cos(Math.random() * Math.PI * 2) * 50 + 50,
                        y: Math.sin(Math.random() * Math.PI * 2) * 50 + 50,
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
        }, [isTransitioning]);

    return (
        <div className={`home-container ${theme} ${isLoaded ? 'loaded' : ''} ${isTransitioning ? 'transitioning' : ''}`}>
            {/* BACKGROUND LAYER */}
            <div className="background-layer">
                <div className="sky-gradient"></div>
                <div className="clouds-layer"></div>
                {theme === 'divine' ? (
                    <div className="divine-rays">
                        <div className="ray r1"></div>
                        <div className="ray r2"></div>
                        <div className="ray r3"></div>
                    </div>
                ) : (
                    <div className="dark-fog">
                        <div className="fog f1"></div>
                        <div className="fog f2"></div>
                        <div className="embers"></div>
                    </div>
                )}
                <div className="scenery scenery-left"></div>
                <div className="scenery scenery-right"></div>
            </div>

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

            {/* TOP HUD */}
            <header className="top-hud">
                <div className="hud-content">
                    {/* Avatar Section */}
                    <div className="avatar-section" onClick={() => navigate('/profile')} title='Profile'>
                        <div className="avatar-frame">
                            <img 
                                src={theme === 'divine' ? '/assets/home_icons/Cadre_avatar_divine.png' : '/assets/home_icons/Cardre_avatar_dark.png'}
                                alt="Avatar Frame"
                                className="avatar-frame-image"
                            />
                            <div className="avatar-placeholder">
                                {playerData?.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="status-indicator"></div>
                        </div>
                        <div className="player-info">
                            <span className="player-name">{playerData?.username || 'Voyageur'}</span>
                            <div className="level-info">
                                <span className="level-badge">Niv. {playerData?.level || 1}</span>
                                <div className="xp-bar-container">
                                    <div className="xp-bar" style={{ width: `${xpPercent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resources Section */}
                    <div className="resources-section">
                        <div className="resource-item gold" title="Or">
                            <span className="icon">🪙</span>
                            <span className="count">{resources.gold.toLocaleString()}</span>
                        </div>
                        <div className="resource-item gems" title="Gemmes">
                            <span className="icon">💎</span>
                            <span className="count">{resources.gems.toLocaleString()}</span>
                        </div>
                        <div className="resource-item tickets" title="Tickets d'invocation">
                            <span className="icon">🎫</span>
                            <span className="count">{resources.tickets}</span>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <div className="theme-toggle-wrapper">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* CENTRAL ZONE - PORTAL */}
            <main className="central-zone">
                <Portal 
                    onInvoke={handlePortalInvoke}
                    isLoading={false}
                    transitioning={isTransitioning}
                />
            </main>

            <div className={`home-transition-overlay ${theme}`} aria-hidden="true"></div>

            {/* SECONDARY NAVIGATION */}
            <nav className="secondary-nav">
                <button className="nav-item" onClick={() => navigate('/inventory')}>
                    <img 
                        src={theme === 'divine' ? '/assets/home_icons/Inventaire_divine.png' : '/assets/home_icons/Inventaire_dark.png'}
                        alt="Inventaire"
                        className="nav-icon-image"
                    />
                    <span className="nav-label">Inventaire</span>
                </button>
                <div className="nav-divider"></div>
                <button className="nav-item" onClick={() => navigate('/profile')}>
                    <img 
                        src={theme === 'divine' ? '/assets/home_icons/Profile_divine.png' : '/assets/home_icons/Profile_dark.png'}
                        alt="Profil"
                        className="nav-icon-image"
                    />
                    <span className="nav-label">Profil</span>
                </button>
            </nav>
        </div>
    );
};

export default Home;
