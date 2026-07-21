// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { notifyError } from '../../services/notificationService';
import { logger } from '../../services/logger';
import PageBackground from '../../components/PageBackground/PageBackground';
import { PlayerAvatar, PlayerResources } from '../../components/GameHUD/GameHUD';

const Profile = () => {
  const { theme } = useTheme();
  const { playerData } = usePlayer();
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  logger.debug('Profile', 'Render', {
    playerData,
    monsterCount: playerData?.monsterIds.length,
  });

  const xpPercent = playerData ? (playerData.experience % 1000) / 10 : 0;

  const handleLogout = () => {
    // La révocation du token côté API est gérée par AuthContext.logout
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleteConfirmOpen(false);
    try {
      await authService.deleteAccount(token);
      logout();
      navigate('/login');
    } catch {
      notifyError('Erreur lors de la suppression du compte.');
    }
  };

  return (
    <div className={`profile-container ${theme}`}>
      <PageBackground theme={theme} className="global-bg" showFogEffects={false} />

      <div className="profile-header glass-panel">
        <button className="nav-back-btn" onClick={() => navigate('/home')}>
          ← Retour
        </button>

        <div className="profile-main">
          <PlayerAvatar
            variant="panel"
            username={playerData?.username}
            level={playerData?.level}
            xpPercent={xpPercent}
          />

          <PlayerResources
            variant="panel"
            resources={{
              gold: playerData?.gold ?? 0,
              gems: playerData?.gems ?? 0,
              tickets: playerData?.tickets ?? 0,
            }}
          />

          <div className="header-actions">
            <button className="action-btn" onClick={handleLogout}>
              Se déconnecter
            </button>
            <button className="action-btn" onClick={() => navigate('/infos')}>
              Infos
            </button>
            <button
              className="action-btn delete-btn"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              Supprimer le compte
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="profile-content">
        <section className="section glass-panel profile-overview">
          <h3>Résumé</h3>
          <div className="overview-grid">
            <div className="overview-item">
              <strong>XP</strong>
              <span>{playerData?.experience ?? 0}</span>
            </div>
            <div className="overview-item">
              <strong>Monstres possédés</strong>
              <span>{playerData?.monsterIds?.length ?? 0}</span>
            </div>
          </div>
        </section>
      </main>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Supprimer le compte"
        message="Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible."
        confirmText="Supprimer"
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        isDangerous
      />
    </div>
  );
};

export default Profile;
