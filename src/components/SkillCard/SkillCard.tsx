import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './SkillCard.css';

const SkillCard = ({
  skill,
  flipOnHover = false,
  disableClickFlip = false,
  onClick = (_e) => {},
}) => {
  const { theme } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);

  if (!skill) return null;

  const defaultSkillBg =
    theme === 'dark'
      ? '/assets/skills/Default_skill_dark.webp'
      : '/assets/skills/Default_skill_divine.webp';

  // const initialSrc = skill.imageUrl || skill.icon || defaultSkillBg;
  const b = '/assets/Barrière_de_Lumière.webp';
  const e = '/assets/Enigme_Runique.webp';
  const j = '/assets/Jugement_Solaire.webp';
  const p = '/assets/Poing_de_Pierre.webp';
  const s = '/assets/sphinx_skill_4.webp';
  let initialSrc;
  if (skill.name === 'Barrière de Lumière') {
    initialSrc = b;
  } else if (skill.name === 'Énigme Runique') {
    initialSrc = e;
  } else if (skill.name === 'Jugement Solaire') {
    initialSrc = j;
  } else if (skill.name === 'Poing de Pierre') {
    initialSrc = p;
  } else if (skill.name === 'Sagesse Ancestrale') {
    initialSrc = s;
  } else {
    initialSrc = skill.imageUrl || skill.icon || defaultSkillBg;
  }

  const [currentImage, setCurrentImage] = useState(initialSrc);

  useEffect(() => {
    let initialSrc;
    if (skill.name === 'Barrière de Lumière') {
      initialSrc = b;
    } else if (skill.name === 'Énigme Runique') {
      initialSrc = e;
    } else if (skill.name === 'Jugement Solaire') {
      initialSrc = j;
    } else if (skill.name === 'Poing de Pierre') {
      initialSrc = p;
    } else if (skill.name === 'Sagesse Ancestrale') {
      initialSrc = s;
    } else {
      initialSrc = skill.imageUrl || skill.icon || defaultSkillBg;
    }
    setCurrentImage(initialSrc);
  }, [skill, theme, defaultSkillBg]);

  const handleClick = (e) => {
    if (!disableClickFlip) {
      setIsFlipped(!isFlipped);
    }
    if (onClick) {
      onClick(e);
    }
  };

  const normalizedRank = (skill.rank || 'COMMON').toUpperCase();
  const rankClass = normalizedRank.toLowerCase();

  const rankToImage = {
    COMMON: '/assets/ranks/Rank_Common.webp',
    RARE: '/assets/ranks/Rank_Rare.webp',
    EPIC: '/assets/ranks/Rank_Epic.webp',
    LEGENDARY: '/assets/ranks/Rank_Legendary.webp',
  };

  const defaultRankImage = '/assets/ranks/Default_Rank.webp';
  const description =
    skill.description ||
    skill.desc ||
    skill.description_carte ||
    'Aucune description disponible.';

  const hasRatio =
    skill.ratio &&
    typeof skill.ratio === 'object' &&
    skill.ratio.stat &&
    skill.ratio.percent !== undefined;

  const ratioPercentRaw = Number(skill.ratio?.percent ?? 0);
  const ratioPercent = Number.isFinite(ratioPercentRaw)
    ? ratioPercentRaw <= 1
      ? Math.round(ratioPercentRaw * 100)
      : Math.round(ratioPercentRaw)
    : 0;

  const details = [
    {
      label: 'Dégâts',
      value:
        skill.damage !== undefined && skill.damage !== null
          ? `${skill.damage}`
          : 'N/A',
    },
    {
      label: 'Ratio',
      value: hasRatio
        ? `${String(skill.ratio.stat).toUpperCase()} x ${ratioPercent}%`
        : 'N/A',
    },
    {
      label: 'Cooldown',
      value:
        skill.cooldown !== undefined && skill.cooldown !== null
          ? `${skill.cooldown} tour${Number(skill.cooldown) > 1 ? 's' : ''}`
          : 'N/A',
    },
    {
      label: 'Niveau max',
      value:
        skill.lvlMax !== undefined && skill.lvlMax !== null
          ? `${skill.lvlMax}`
          : 'N/A',
    },
  ];

  if (skill.cost !== undefined && skill.cost !== null) {
    details.push({ label: 'Coût', value: `${skill.cost} MP` });
  }

  if (skill.type) {
    details.push({ label: 'Type', value: String(skill.type) });
  }

  return (
    <div
      className={`skill-card-container ${flipOnHover ? 'hover-flip' : ''}`}
      onClick={handleClick}
    >
      <img
        src={currentImage}
        alt=""
        style={{ display: 'none' }}
        onError={() => {
          if (currentImage !== defaultSkillBg) {
            setCurrentImage(defaultSkillBg);
          }
        }}
      />

      <div className={`skill-card-flipper ${isFlipped ? 'flipped' : ''}`}>
        <div
          className={`skill-card-face skill-card-front rank-${rankClass} ${theme}`}
          style={{ backgroundImage: `url(${currentImage})` }}
        >
          <img
            src={rankToImage[normalizedRank] || defaultRankImage}
            alt={normalizedRank}
            className="skill-rank-icon-front"
          />

          <div className="skill-card-overlay" />

          <div className="skill-front-content">
            <h3 className="skill-name-front">
              {skill.name || 'Compétence inconnue'}
            </h3>
          </div>
        </div>

        <div
          className={`skill-card-face skill-card-back rank-${rankClass} ${theme}`}
          style={{ backgroundImage: `url(${currentImage})` }}
        >
          <div className="skill-card-overlay" />
          <div className="skill-card-grid">
            <div className="skill-back-top">
              <h3 className="skill-name">
                {skill.name || 'Compétence inconnue'}
              </h3>
              <span className={`skill-rank-badge rank-${rankClass}`}>
                {normalizedRank}
              </span>
            </div>

            <div className="skill-back-content">
              <div className="skill-description-block">
                <div className="skill-section-title">Description</div>
                <p className="skill-description">{description}</p>
              </div>

              <div className="skill-details-block">
                <div className="skill-section-title">Détails</div>
                <div className="skill-details-grid">
                  {details.map((detail) => (
                    <div className="skill-detail-item" key={detail.label}>
                      <span className="skill-detail-label">{detail.label}</span>
                      <span className="skill-detail-value">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
