import React from 'react';
import GatchaCard from '../../components/GatchaCard';
import './MonsterPreviewTab.css';

const MonsterPreviewTab = ({ monster }) => (
  <div className="preview-tab" style={{ containerType: 'inline-size' }}>
    <h2>Preview de la Carte</h2>
    <GatchaCard monstre={monster.monster_data} />
  </div>
);

export default MonsterPreviewTab;
