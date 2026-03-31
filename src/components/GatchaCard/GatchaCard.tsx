import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../services/adminService';
import './GatchaCard.css';

const clampPercent = (value) => Math.max(0, Math.min(100, value));

const toFiniteNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const GatchaCard = ({
  monstre,
  flipOnHover = false,
  disableClickFlip = false,
  onClick,
}) => {
  const defaultImage = '/assets/monsters/Default_Monster.png';
  const defaultElementImage = '/assets/elements/Default_Element.png';
  const defaultRankImage = '/assets/ranks/Default_Rank.png';
  const [isFlipped, setIsFlipped] = useState(false);
  const [stateStats, setStateStats] = useState(null);

  const initialSrc = monstre?.nom
    ? `/assets/monsters/${monstre.nom}.png`
    : defaultImage;
  const [currentImage, setCurrentImage] = useState(initialSrc);

  // Reset image when monster prop changes
  useEffect(() => {
    setCurrentImage(
      monstre?.ImageUrl
        ? monstre?.ImageUrl
        : monstre?.nom
          ? `/assets/monsters/${monstre.nom}.png`
          : defaultImage
    );
  }, [monstre]);

  useEffect(() => {
    let isMounted = true;

    if (!monstre) {
      setStateStats(null);
      return () => {
        isMounted = false;
      };
    }

    adminApiService
      .getMonsterStatsByState('PENDING_REVIEW')
      .then((data) => {
        if (isMounted) {
          setStateStats(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStateStats(null);
        }
      });

    return () => {
      isMounted = false;
    };
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
  const rankClass = (monstre.rang || 'COMMON').toLowerCase();

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
    {
      key: 'hp',
      apiKey: 'hp',
      label: 'HP',
      value: toFiniteNumber(monstre.stats?.hp),
    },
    {
      key: 'atk',
      apiKey: 'atk',
      label: 'ATK',
      value: toFiniteNumber(monstre.stats?.atk),
    },
    {
      key: 'def',
      apiKey: 'def_',
      label: 'DEF',
      value: toFiniteNumber(monstre.stats?.def),
    },
    {
      key: 'vit',
      apiKey: 'vit',
      label: 'VIT',
      value: toFiniteNumber(monstre.stats?.vit),
    },
  ];

  const fallbackMaxStat = Math.max(
    ...stats.map((s) => (Number.isFinite(s.value) ? s.value : 0)),
    1
  );

  // Image handling moved to state
  const lore = monstre.description || monstre.description_carte || '';

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
        onError={() => {
          if (currentImage !== defaultImage) {
            setCurrentImage(defaultImage);
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
            src={rankToImage[monstre.rang] || defaultRankImage}
            alt={monstre.rang}
            className="rank-icon-front"
          />
          <img
            src={elementToImage[elementClass] || defaultElementImage}
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
              <div className={`rank-chip rank-${rankClass}`}>
                {monstre.rang || '???'}
              </div>
              <div className={`element-chip element-${elementClass}`}>
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
                  const reference = stateStats?.[stat.apiKey] || null;
                  const globalMax = Math.max(
                    1,
                    toFiniteNumber(reference?.max, fallbackMaxStat)
                  );
                  const width = clampPercent((stat.value / globalMax) * 100);
                  const minMarker = clampPercent(
                    (toFiniteNumber(reference?.min, 0) / globalMax) * 100
                  );
                  const avgMarker = clampPercent(
                    (toFiniteNumber(reference?.avg, 0) / globalMax) * 100
                  );

                  return (
                    <div key={stat.key} className="stat-row">
                      <span className="stat-label">{stat.label}</span>
                      <div className="stat-bar">
                        <span
                          className="stat-bar-fill"
                          style={{ width: `${width}%` }}
                        />
                        {reference && (
                          <>
                            <span
                              className="stat-marker stat-marker-min"
                              style={{ left: `${minMarker}%` }}
                              aria-hidden="true"
                            >
                              <span className="stat-marker-label">min</span>
                            </span>
                            <span
                              className="stat-marker stat-marker-avg"
                              style={{ left: `${avgMarker}%` }}
                              aria-hidden="true"
                            >
                              <span className="stat-marker-label">avg</span>
                            </span>
                          </>
                        )}
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
