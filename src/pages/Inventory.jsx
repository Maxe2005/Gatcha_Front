import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'; // Assuming we reuse Header or build a custom one
import GatchaCard from '../components/GatchaCard';
import SkillCard from '../components/SkillCard';
import './Inventory.css';
import ThemeToggle from '../components/ThemeToggle';

// Mock Data pour le développement si playerData est vide
const MOCK_INVENTORY = Array.from({ length: 24 }).map((_, i) => ({
  id: i,
  nom: `Monster ${i + 1}`,
  element: ['fire', 'water', 'wind', 'earth', 'light', 'darkness'][i % 6],
  rang: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'][i % 4],
  stats: { hp: 100 + i * 10, atk: 50 + i * 5, def: 30 + i * 2, vit: 10 + i },
  lore: 'Une créature ancienne cachée dans les profondeurs de ce monde.',
  image: null,
  skills: [
    {
      name: 'Frappe Rapide',
      description: 'Inflige 120% dégâts physiques.',
      cost: 10,
      cooldown: 3,
    },
    {
      name: 'Bouclier Élémentaire',
      description: 'Réduit les dégâts de 30% pendant 2 tours.',
      cost: 25,
      cooldown: 8,
    },
    {
      name: 'Ultimatum',
      description:
        'Une attaque dévastatrice qui consomme tous les HP restants.',
      cost: 0,
      cooldown: 120,
    },
  ],
}));

const Inventory = () => {
  const { theme } = useTheme();
  const { playerData } = usePlayer();
  const navigate = useNavigate();

  // Si playerData.inventory existe, on l'utilise, sinon Mock
  const inventoryData = playerData?.inventory || MOCK_INVENTORY;

  const [filterRarity, setFilterRarity] = useState('ALL');
  const [filterElement, setFilterElement] = useState('ALL');
  const [cardsPerRow, setCardsPerRow] = useState(4);

  const [selectedMonster, setSelectedMonster] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Filter Logic
  const filteredCards = inventoryData.filter((card) => {
    if (filterRarity !== 'ALL' && card.rang !== filterRarity) return false;
    if (filterElement !== 'ALL' && card.element !== filterElement) return false;
    return true;
  });

  const handleCardDoubleClick = (monster) => {
    setSelectedMonster(monster);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300); // Transition buffer
  };

  const closeDetailView = () => {
    setIsTransitioning(true);
    setSelectedMonster(null);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeDetailView();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div
      className={`inventory-container ${theme} ${selectedMonster ? 'blur-background' : ''}`}
    >
      {/* BACKGROUND (Copied structure from Home for consistency) */}
      <div className="background-layer global-bg">
        <div className="sky-gradient"></div>
        <div className="clouds-layer"></div>
        <div className={theme === 'divine' ? 'divine-rays' : 'dark-fog'}>
          {theme === 'divine' ? (
            <>
              <div className="ray r1"></div>
              <div className="ray r2"></div>
            </>
          ) : (
            <>
              <div className="fog f1"></div>
              <div className="fog f2"></div>
              <div className="embers"></div>
            </>
          )}
        </div>
      </div>

      {/* HEADER / HUD */}
      <div className="filter-bar glass-panel">
        <button
          className="nav-back-btn glass-panel"
          onClick={() => navigate('/home')}
        >
          ← Retour
        </button>
        <div className="filter-group">
          <label>Rareté:</label>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
          >
            <option value="ALL">Tout</option>
            <option value="COMMON">Commun</option>
            <option value="RARE">Rare</option>
            <option value="EPIC">Epique</option>
            <option value="LEGENDARY">Légendaire</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Élément:</label>
          <select
            value={filterElement}
            onChange={(e) => setFilterElement(e.target.value)}
          >
            <option value="ALL">Tout</option>
            <option value="fire">Feu</option>
            <option value="water">Eau</option>
            <option value="wind">Vent</option>
            <option value="earth">Terre</option>
            <option value="light">Lumière</option>
            <option value="darkness">Ténèbres</option>
          </select>
        </div>

        <div className="filter-group view-control">
          <label>Grille:</label>
          <input
            type="range"
            min="3"
            max="6"
            value={cardsPerRow}
            onChange={(e) => setCardsPerRow(Number(e.target.value))}
          />
        </div>

        <div className="header-theme-toggle">
          <ThemeToggle />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="inventory-scroll-area">
        <div
          className="inventory-grid"
          style={{ '--cards-per-row': cardsPerRow }}
        >
          {filteredCards.map((monster, index) => (
            <div
              key={monster.id || index}
              className="inventory-card-wrapper"
              onClick={() => handleCardDoubleClick(monster)}
            >
              <GatchaCard
                monstre={monster}
                flipOnHover={true}
                disableClickFlip={true}
              />
            </div>
          ))}
        </div>
        {filteredCards.length === 0 && (
          <div className="empty-state">
            <p>Aucun monstre ne correspond à vos critères.</p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedMonster && (
        <div
          className={`detail-overlay ${isTransitioning ? 'fade-in' : 'visible'}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDetailView();
          }}
        >
          <button className="close-btn" onClick={closeDetailView}>
            ×
          </button>

          <div className="detail-content glass-panel">
            {/* LEFT: BIG CARD */}
            <div className="detail-left">
              <div className="big-card-container">
                {/* We force a non-flipped state visually or just reuse GatchaCard but scaled up */}
                <GatchaCard monstre={selectedMonster} />
              </div>
            </div>

            {/* RIGHT: INFO & SKILLS */}
            <div className="detail-right">
              <h1 className="detail-title">{selectedMonster.nom}</h1>
              <div className="detail-tags">
                <span className={`tag rank-${selectedMonster.rang}`}>
                  {selectedMonster.rang}
                </span>
                <span className={`tag element-${selectedMonster.element}`}>
                  {selectedMonster.element}
                </span>
              </div>

              <div className="detail-stats-grid">
                <div className="stat-box">
                  <span>HP</span> <strong>{selectedMonster.stats?.hp}</strong>
                </div>
                <div className="stat-box">
                  <span>ATK</span> <strong>{selectedMonster.stats?.atk}</strong>
                </div>
                <div className="stat-box">
                  <span>DEF</span> <strong>{selectedMonster.stats?.def}</strong>
                </div>
                <div className="stat-box">
                  <span>VIT</span> <strong>{selectedMonster.stats?.vit}</strong>
                </div>
              </div>

              <div className="detail-lore">
                <h3>Origine</h3>
                <p>
                  {selectedMonster.lore ||
                    "L'origine de cette créature reste un mystère pour les érudits."}
                </p>
              </div>

              <div className="detail-skills">
                <h3>Compétences</h3>
                <div className="skills-list">
                  {(selectedMonster.skills || []).map((skill, idx) => (
                    <SkillCard key={idx} skill={skill} />
                  ))}
                  {(!selectedMonster.skills ||
                    selectedMonster.skills.length === 0) && (
                    <div className="no-skills">Aucune compétence connue.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
