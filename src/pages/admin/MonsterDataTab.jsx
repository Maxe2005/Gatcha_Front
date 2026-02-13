import React from 'react';

const MonsterDataTab = ({ monster }) => (
  <div className="data-tab">
    <h2>Données du Monstre</h2>
    <pre>{JSON.stringify(monster?.monster_data, null, 2)}</pre>
  </div>
);

export default MonsterDataTab;
