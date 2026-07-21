import React from 'react';

type HudVariant = 'floating' | 'panel';

interface PlayerAvatarProps {
  variant: HudVariant;
  username?: string;
  level?: number;
  xpPercent: number;
  avatarFrameImage?: string;
  onAvatarClick?: () => void;
}

export interface PlayerResourcesData {
  gold?: number;
  gems?: number;
  tickets?: number;
}

interface PlayerResourcesProps {
  variant: HudVariant;
  resources?: PlayerResourcesData;
}

/**
 * Avatar joueur (image/placeholder + niveau + barre d'XP), réutilisé par
 * Home ("floating" : pastille de la barre du haut) et Profile ("panel" :
 * bloc d'en-tête de la page profil), qui ont chacun leur propre CSS.
 */
export const PlayerAvatar = ({
  variant,
  username,
  level,
  xpPercent,
  avatarFrameImage,
  onAvatarClick,
}: PlayerAvatarProps) => {
  const initial = username?.charAt(0).toUpperCase() || '?';

  if (variant === 'panel') {
    return (
      <div className="avatar-block">
        <div className="avatar-frame">
          <div className="avatar-placeholder">{initial}</div>
        </div>
        <div className="player-meta">
          <h2 className="player-name">{username || 'Voyageur'}</h2>
          <div className="level-row">
            <span className="level-badge">Niv. {level || 1}</span>
            <div className="xp-bar-container">
              <div className="xp-bar" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="avatar-section"
      onClick={onAvatarClick}
      title="Profile"
      role="button"
      tabIndex={0}
      aria-label="Voir le profil"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAvatarClick?.();
        }
      }}
    >
      <div className="avatar-frame">
        {avatarFrameImage && (
          <img
            src={avatarFrameImage}
            alt="Avatar Frame"
            className="avatar-frame-image"
          />
        )}
        <div className="avatar-placeholder">{initial}</div>
        <div className="status-indicator" />
      </div>
      <div className="player-info">
        <span className="player-name">{username || 'Voyageur'}</span>
        <div className="level-info">
          <span className="level-badge">Niv. {level || 1}</span>
          <div className="xp-bar-container">
            <div className="xp-bar" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Ressources du joueur (or/gemmes/tickets), même variantes que PlayerAvatar.
 */
export const PlayerResources = ({ variant, resources }: PlayerResourcesProps) => {
  const { gold = 0, gems = 0, tickets = 0 } = resources || {};

  if (variant === 'panel') {
    return (
      <div className="resources-block">
        <div className="resource-item">
          <div className="label">Or</div>
          <div className="value">{gold}</div>
        </div>
        <div className="resource-item">
          <div className="label">Gemmes</div>
          <div className="value">{gems}</div>
        </div>
        <div className="resource-item">
          <div className="label">Tickets</div>
          <div className="value">{tickets}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-section">
      <div className="resource-item gold" title="Or">
        <span className="icon">🪙</span>
        <span className="count">{gold.toLocaleString()}</span>
      </div>
      <div className="resource-item gems" title="Gemmes">
        <span className="icon">💎</span>
        <span className="count">{gems.toLocaleString()}</span>
      </div>
      <div className="resource-item tickets" title="Tickets d'invocation">
        <span className="icon">🎫</span>
        <span className="count">{tickets}</span>
      </div>
    </div>
  );
};
