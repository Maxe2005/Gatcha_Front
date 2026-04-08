import React from 'react';
import './MonsterHistoryTab.css';

const MonsterHistoryTab = ({ history }) => (
  <div className="history-tab">
    <h2>Historique</h2>
    {history && history.length > 0 ? (
      <div className="history-list">
        {history.map((entry, idx) => {
          // Nouvelle forme : timeline entries with event_type
          if (entry.event_type) {
            const date = entry.happened_at || entry.happenedAt || entry.timestamp;
            return (
              <div key={idx} className={`history-item event-${entry.event_type}`}>
                <div className="history-header">
                  <strong>
                    {entry.event_type === 'state_transition'
                      ? 'Transition d’état'
                      : 'Mise à jour des données'}
                  </strong>
                  <span className="actor">{entry.actor || 'system'}</span>
                  <span className="time">
                    {date && new Date(date).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="history-body">
                  {entry.summary && <div className="summary">{entry.summary}</div>}

                  {entry.event_type === 'state_transition' && entry.details && (
                    <div className="transition">
                      <span className="from-state">{entry.details.from_state}</span>
                      <span className="arrow">→</span>
                      <span className="to-state">{entry.details.to_state}</span>
                      {entry.details.note && (
                        <div className="note">{entry.details.note}</div>
                      )}
                    </div>
                  )}

                  {entry.event_type === 'data_update' && entry.details && (
                    <div className="data-update">
                      {Array.isArray(entry.details.changed_fields) && entry.details.changed_fields.length > 0 ? (
                        <div>
                          <strong>Champs modifiés :</strong>
                          <ul>
                            {entry.details.changed_fields.map((f, i) => (
                              <li key={i}>{String(f)}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div>Aucun champ modifié</div>
                      )}

                      <div>
                        <strong>Validation :</strong>{' '}
                        {String(entry.details.validation_before)} → {String(entry.details.validation_after)}
                      </div>
                      <div>
                        <strong>Mode de stockage :</strong>{' '}
                        {entry.details.storage_mode_before} → {entry.details.storage_mode_after}
                      </div>
                      {entry.details.reason && (
                        <div>
                          <strong>Raison :</strong> {entry.details.reason}
                        </div>
                      )}
                      {entry.details.source && (
                        <div>
                          <strong>Source :</strong> {entry.details.source}
                        </div>
                      )}
                      {entry.details.diff_payload && (
                        <pre className="diff">{JSON.stringify(entry.details.diff_payload, null, 2)}</pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Ancien format (legacy)
          const date = entry.timestamp || entry.happened_at;
          return (
            <div key={idx} className="history-item">
              <div className="history-transition">
                <span className="from-state">{entry.from_state}</span>
                <span className="arrow">→</span>
                <span className="to-state">{entry.to_state}</span>
              </div>
              <div className="history-details">
                <span>{entry.actor || 'System'}</span>
                <span>{date && new Date(date).toLocaleString('fr-FR')}</span>
                {entry.note && <span className="note">{entry.note}</span>}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p>Aucun historique disponible</p>
    )}
  </div>
);

export default MonsterHistoryTab;
