import React, { useState } from 'react';
import './GatchaCard.css';

const GatchaCard = ({ monstre }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    if (!monstre) return null;

    const elementClass = (monstre.element || 'neutre').toLowerCase();
    
    // Mapping rang vers image
    const rankToImage = {
        'Commun': '/assets/ranks/Rank_Common.png',
        'Rare': '/assets/ranks/Rank_Rare.png',
        'Épique': '/assets/ranks/Rank_Epic.png',
        'Légendaire': '/assets/ranks/Rank_Legendary.png',
    };
    
    // Mapping élément vers image
    const elementToImage = {
        'feu': '/assets/elements/Element_fire.png',
        'eau': '/assets/elements/Element_water.png',
        'vent': '/assets/elements/Element_wind.png',
        'terre': '/assets/elements/Element_earth.png',
        'lumiere': '/assets/elements/Element_light.png',
        'tenebre': '/assets/elements/Element_darkness.png',
    };
    
    const stats = [
        { key: 'hp', label: 'HP', value: Number(monstre.stats?.hp ?? 0) },
        { key: 'atk', label: 'ATK', value: Number(monstre.stats?.atk ?? 0) },
        { key: 'def', label: 'DEF', value: Number(monstre.stats?.def ?? 0) },
        { key: 'vit', label: 'VIT', value: Number(monstre.stats?.vit ?? 0) },
    ];

    const maxStat = Math.max(...stats.map((s) => (Number.isFinite(s.value) ? s.value : 0)), 1);
    const imageSrc = monstre.image ? `/assets/monsters/${monstre.image}` : `/assets/monsters/Default_Monster.png`;
    const lore = monstre.lore || monstre.description || '';

    return (
        <div className="card-container" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`card-flipper ${isFlipped ? 'flipped' : ''}`}>
                {/* RECTO */}
                <div className={`card-face card-front element-${elementClass}`} style={{ backgroundImage: `url(${imageSrc})` }}>
                    <img 
                        src={rankToImage[monstre.rang] || '/assets/ranks/Default_Rank.png'}
                        alt={monstre.rang}
                        className="rank-icon-front"
                    />
                    <img 
                        src={elementToImage[elementClass] || '/assets/elements/Default_Element.png'}
                        alt={monstre.element}
                        className="element-icon-front"
                    />
                    <div className="card-overlay" />
                    <div className="front-content">
                        <h2 className="monster-name-front">{monstre.nom || 'Monstre Mystère'}</h2>
                    </div>
                </div>

                {/* VERSO */}
                <div className={`card-face card-back element-${elementClass}`} style={{ backgroundImage: `url(${imageSrc})` }}>
                    <div className="card-overlay" />
                    <div className="card-grid">
                        <div className="card-top">
                            <div className="rank-chip">{monstre.rang || '???'}</div>
                            <div className="element-chip">{(monstre.element || 'Neutre').toUpperCase()}</div>
                        </div>

                        <div className="back-content-center">
                            <h2 className="monster-name">{monstre.nom || 'Monstre Mystère'}</h2>
                            {lore && <p className="monster-lore">{lore}</p>}
                        </div>

                        <div className="stats-block">
                            <div className="stats-title">Statistiques</div>
                            <div className="stats-list">
                                {stats.map((stat) => {
                                    const width = Math.max(8, Math.min(100, Math.round((stat.value / maxStat) * 100)));
                                    return (
                                        <div key={stat.key} className="stat-row">
                                            <span className="stat-label">{stat.label}</span>
                                            <div className="stat-bar">
                                                <span className="stat-bar-fill" style={{ width: `${width}%` }} />
                                            </div>
                                            <span className="stat-value">{Number.isFinite(stat.value) ? stat.value : 0}</span>
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
