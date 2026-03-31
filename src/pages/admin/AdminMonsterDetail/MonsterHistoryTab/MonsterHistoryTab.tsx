import React from 'react';

const MonsterHistoryTab = ({ history }) => (
  <div className="history-tab">
    <h2>Historique des Transitions</h2>
    {history && history.length > 0 ? (
      <div className="history-list">
        {history.map((entry, idx) => (
          <div key={idx} className="history-item">
            <div className="history-transition">
              <span className="from-state">{entry.from_state}</span>
              <span className="arrow">→</span>
              <span className="to-state">{entry.to_state}</span>
            </div>
            <div className="history-details">
              <span>{entry.actor || 'System'}</span>
              <span>{new Date(entry.timestamp).toLocaleString('fr-FR')}</span>
              {entry.note && <span className="note">{entry.note}</span>}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p>Aucun historique disponible</p>
    )}
  </div>
);

export default MonsterHistoryTab;
