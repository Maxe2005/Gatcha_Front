import React from 'react';
import './GatchaCard.css';

const GatchaCard = ({ monstre }) => {
    if (!monstre) return null;

    const elementClass = (monstre.element || 'neutre').toLowerCase();
    const stats = [
        { key: 'hp', label: 'HP', value: Number(monstre.stats?.hp ?? 0) },
        { key: 'atk', label: 'ATK', value: Number(monstre.stats?.atk ?? 0) },
        { key: 'def', label: 'DEF', value: Number(monstre.stats?.def ?? 0) },
        { key: 'vit', label: 'VIT', value: Number(monstre.stats?.vit ?? 0) },
    ];

    const maxStat = Math.max(...stats.map((s) => (Number.isFinite(s.value) ? s.value : 0)), 1);
    const imageSrc = `/assets/monsters/${monstre.image || 'default.png'}`;
    const lore = monstre.lore || monstre.description || '';

    return (
        <div className={`gatcha-card element-${elementClass}`}>
            <div className="card-veil" aria-hidden />
            <div className="card-grid">
                <div className="card-top">
                    <div className="rank-chip">Rang {monstre.rang || '???'}</div>
                    <div className="element-chip">{(monstre.element || 'Neutre').toUpperCase()}</div>
                </div>

                <h2 className="monster-name">{monstre.nom || 'Monstre Mystère'}</h2>
                {lore && <p className="monster-lore">{lore}</p>}

                <div className="image-frame">
                    <span className="halo" aria-hidden />
                    <img src={imageSrc} alt={monstre.nom || 'Monstre'} className="monster-img" />
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
    );
};

export default GatchaCard;
