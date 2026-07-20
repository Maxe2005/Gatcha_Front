// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React from 'react';
import './MonsterValidationTab.css';

const MonsterValidationTab = ({ monster, onNavigateToField }) => (
  <div className="validation-tab">
    <h2>Rapport de Validation</h2>
    {monster?.metadata?.validation_errors &&
    monster.metadata.validation_errors.length > 0 ? (
      <div className="errors-list">
        {monster.metadata.validation_errors.map((error, idx) => (
          <div
            key={idx}
            className="error-item clickable"
            onClick={() => onNavigateToField && onNavigateToField(error.field)}
            title="Cliquez pour naviguer vers ce champ"
          >
            <strong>{error.field}</strong>: {error.message}
            <span className="navigate-icon">→</span>
          </div>
        ))}
      </div>
    ) : (
      <p>Aucune erreur de validation détectée.</p>
    )}
    {monster?.validation_report && (
      <>
        <h3>Rapport complet</h3>
        <pre>{JSON.stringify(monster.validation_report, null, 2)}</pre>
      </>
    )}
  </div>
);

export default MonsterValidationTab;
