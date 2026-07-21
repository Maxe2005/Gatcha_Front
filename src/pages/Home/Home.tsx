// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import Portal from '../../components/Portal/Portal';
import CanvasParticleSystem from '../../components/CanvasParticleSystem';
import PageBackground from '../../components/PageBackground/PageBackground';
import { PlayerAvatar, PlayerResources } from '../../components/GameHUD/GameHUD';

const Home = () => {
  const { theme } = useTheme();
  const { playerData } = usePlayer();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Simulation de chargement pour l'animation d'entrée
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Placeholder pour les ressources (si non présentes dans l'API)
  // À remplacer par playerData.gold, playerData.gems quand disponibles
  const resources = {
    gold: playerData?.gold || 0,
    gems: playerData?.gems || 0,
    tickets: playerData?.tickets || 0,
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

  return (
    <div
      className={`home-container ${theme} ${isLoaded ? 'loaded' : ''} ${isTransitioning ? 'transitioning' : ''}`}
    >
      {/* BACKGROUND LAYER */}
      <PageBackground theme={theme} rayCount={3} showScenery />

      {/* COUCHE E : Particules & FX */}
      <div className="portal-layer particles-layer">
        <CanvasParticleSystem
          theme={theme}
          mode="ambient"
          paused={isTransitioning}
        />
      </div>

      {/* TOP HUD */}
      <header className="top-hud">
        <div className="hud-content">
          <PlayerAvatar
            variant="floating"
            username={playerData?.username}
            level={playerData?.level}
            xpPercent={xpPercent}
            avatarFrameImage={
              theme === 'divine'
                ? '/assets/home_icons/Cadre_avatar_divine.webp'
                : '/assets/home_icons/Cardre_avatar_dark.webp'
            }
            onAvatarClick={() => navigate('/profile')}
          />

          {/* Admin Button - visible uniquement pour l'admin */}
          {isAdmin && (
            <button
              className="admin-dashboard-btn"
              onClick={() => navigate('/admin')}
              title="Accéder au Dashboard Admin"
            >
              Admin
            </button>
          )}

          <PlayerResources variant="floating" resources={resources} />

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

      <div
        className={`home-transition-overlay ${theme}`}
        aria-hidden="true"
      ></div>

      {/* SECONDARY NAVIGATION */}
      <nav className="secondary-nav">
        <button className="nav-item" onClick={() => navigate('/inventory')}>
          <img
            src={
              theme === 'divine'
                ? '/assets/home_icons/Inventaire_divine.webp'
                : '/assets/home_icons/Inventaire_dark.webp'
            }
            alt="Inventaire"
            className="nav-icon-image"
          />
          <span className="nav-label">Inventaire</span>
        </button>
        <div className="nav-divider"></div>
        <button className="nav-item" onClick={() => navigate('/profile')}>
          <img
            src={
              theme === 'divine'
                ? '/assets/home_icons/Profile_divine.webp'
                : '/assets/home_icons/Profile_dark.webp'
            }
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
