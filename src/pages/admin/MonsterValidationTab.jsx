import React from 'react';

const MonsterValidationTab = ({ monster }) => (
  <div className="validation-tab">
    <h2>Rapport de Validation</h2>
    {monster?.metadata?.validation_errors &&
    monster.metadata.validation_errors.length > 0 ? (
      <div className="errors-list">
        {monster.metadata.validation_errors.map((error, idx) => (
          <div key={idx} className="error-item">
            <strong>{error.field}</strong>: {error.message}
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
