import React from 'react';
import GatchaCard from '../../components/GatchaCard';

const MonsterPreviewTab = ({ monster }) => (
  <div className="preview-tab">
    <h2>Preview de la Carte</h2>
    <GatchaCard monstre={monster} />
  </div>
);

export default MonsterPreviewTab;
