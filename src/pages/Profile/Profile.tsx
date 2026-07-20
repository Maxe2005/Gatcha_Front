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
      <div className="background-layer global-bg">
        <div className="sky-gradient" />
        <div className="clouds-layer" />
      </div>

      <div className="profile-header glass-panel">
        <button className="nav-back-btn" onClick={() => navigate('/home')}>
          ← Retour
        </button>

        <div className="profile-main">
          <div className="avatar-block">
            <div className="avatar-frame">
              <div className="avatar-placeholder">
                {playerData?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>
            <div className="player-meta">
              <h2 className="player-name">
                {playerData?.username || 'Voyageur'}
              </h2>
              <div className="level-row">
                <span className="level-badge">
                  Niv. {playerData?.level || 1}
                </span>
                <div className="xp-bar-container">
                  <div className="xp-bar" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="resources-block">
            <div className="resource-item">
              <div className="label">Or</div>
              <div className="value">{playerData?.gold ?? 0}</div>
            </div>
            <div className="resource-item">
              <div className="label">Gemmes</div>
              <div className="value">{playerData?.gems ?? 0}</div>
            </div>
            <div className="resource-item">
              <div className="label">Tickets</div>
              <div className="value">{playerData?.tickets ?? 0}</div>
            </div>
          </div>

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
