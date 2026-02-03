import React, { useState, useEffect } from 'react';
import './GatchaCard.css';

const GatchaCard = ({
  monstre,
  flipOnHover = false,
  disableClickFlip = false,
  onClick,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const initialSrc = monstre?.nom
    ? `/assets/monsters/${monstre.nom}.png`
    : `/assets/monsters/Default_Monster.png`;
  const [currentImage, setCurrentImage] = useState(initialSrc);

  // Reset image when monster prop changes
  useEffect(() => {
    setCurrentImage(
      monstre?.nom
        ? `/assets/monsters/${monstre.nom}.png`
        : `/assets/monsters/Default_Monster.png`
    );
  }, [monstre]);

  if (!monstre) return null;

  const handleClick = (e) => {
    if (!disableClickFlip) {
      setIsFlipped(!isFlipped);
    }
    if (onClick) {
      onClick(e);
    }
  };

  const elementClass = (monstre.element || 'neutre').toLowerCase();

  // Mapping rang vers image
  const rankToImage = {
    COMMON: '/assets/ranks/Rank_Common.png',
    RARE: '/assets/ranks/Rank_Rare.png',
    EPIC: '/assets/ranks/Rank_Epic.png',
    LEGENDARY: '/assets/ranks/Rank_Legendary.png',
  };

  // Mapping élément vers image
  const elementToImage = {
    fire: '/assets/elements/Element_fire.png',
    water: '/assets/elements/Element_water.png',
    wind: '/assets/elements/Element_wind.png',
    earth: '/assets/elements/Element_earth.png',
    light: '/assets/elements/Element_light.png',
    darkness: '/assets/elements/Element_darkness.png',
  };

  const stats = [
    { key: 'hp', label: 'HP', value: Number(monstre.stats?.hp ?? 0) },
    { key: 'atk', label: 'ATK', value: Number(monstre.stats?.atk ?? 0) },
    { key: 'def', label: 'DEF', value: Number(monstre.stats?.def ?? 0) },
    { key: 'vit', label: 'VIT', value: Number(monstre.stats?.vit ?? 0) },
  ];

  const maxStat = Math.max(
    ...stats.map((s) => (Number.isFinite(s.value) ? s.value : 0)),
    1
  );
  // Image handling moved to state
  const lore = monstre.lore || monstre.description || '';

  return (
    <div
      className={`card-container ${flipOnHover ? 'hover-flip' : ''}`}
      onClick={handleClick}
    >
      {/* Hidden image to handle load errors (fallback to default) */}
      <img
        src={currentImage}
        alt=""
        style={{ display: 'none' }}
        onError={(e) => {
          if (currentImage !== '/assets/monsters/Default_Monster.png') {
            setCurrentImage('/assets/monsters/Default_Monster.png');
          }
        }}
      />
      <div className={`card-flipper ${isFlipped ? 'flipped' : ''}`}>
        {/* RECTO */}
        <div
          className={`card-face card-front element-${elementClass}`}
          style={{ backgroundImage: `url(${currentImage})` }}
        >
          <img
            src={rankToImage[monstre.rang] || '/assets/ranks/Default_Rank.png'}
            alt={monstre.rang}
            className="rank-icon-front"
          />
          <img
            src={
              elementToImage[elementClass] ||
              '/assets/elements/Default_Element.png'
            }
            alt={monstre.element}
            className="element-icon-front"
          />
          <div className="card-overlay" />
          <div className="front-content">
            <h2 className="monster-name-front">
              {monstre.nom || 'Monstre Mystère'}
            </h2>
          </div>
        </div>

        {/* VERSO */}
        <div
          className={`card-face card-back element-${elementClass}`}
          style={{ backgroundImage: `url(${currentImage})` }}
        >
          <div className="card-overlay" />
          <div className="card-grid">
            <div className="card-top">
              <div className="rank-chip">{monstre.rang || '???'}</div>
              <div className="element-chip">
                {(monstre.element || 'Neutre').toUpperCase()}
              </div>
            </div>

            <div className="back-content-center">
              <h2 className="monster-name">
                {monstre.nom || 'Monstre Mystère'}
              </h2>
              {lore && <p className="monster-lore">{lore}</p>}
            </div>

            <div className="stats-block">
              <div className="stats-title">Statistiques</div>
              <div className="stats-list">
                {stats.map((stat) => {
                  const width = Math.max(
                    8,
                    Math.min(100, Math.round((stat.value / maxStat) * 100))
                  );
                  return (
                    <div key={stat.key} className="stat-row">
                      <span className="stat-label">{stat.label}</span>
                      <div className="stat-bar">
                        <span
                          className="stat-bar-fill"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="stat-value">
                        {Number.isFinite(stat.value) ? stat.value : 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatchaCard;
