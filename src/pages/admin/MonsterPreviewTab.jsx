import React from 'react';
import GatchaCard from '../../components/GatchaCard';
import './MonsterPreviewTab.css';
import SkillCard from '../../components/SkillCard';

const MonsterPreviewTab = ({ monster }) => (
  <div className="preview-tab" style={{ containerType: 'inline-size' }}>
    <h2>Preview de la Carte</h2>
    <GatchaCard monstre={monster.monster_data} />
    <SkillCard skill={monster.monster_data?.skills?.[0]} />
  </div>
);

export default MonsterPreviewTab;
