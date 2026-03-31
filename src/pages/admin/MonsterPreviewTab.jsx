import React from 'react';
import GatchaCard from '../../components/GatchaCard';
import './MonsterPreviewTab.css';
import SkillCard from '../../components/SkillCard';

const MonsterPreviewTab = ({ monster }) => (
  <div className="preview-tab" style={{ containerType: 'inline-size' }}>
    <h2>Preview de la Carte</h2>
    <div className="preview-layout">
      <div className="preview-monster">
        <GatchaCard monstre={monster.monster_data} />
      </div>
      <div className="preview-skills">
        {monster.monster_data?.skills?.map((skill, index) => (
          <SkillCard key={index} skill={skill} />
        ))}
      </div>
    </div>
  </div>
);

export default MonsterPreviewTab;
