import React from 'react';

const MonsterDataTab = ({ monster }) => {
  const state = monster?.state;
  const showJsonStates = ['GENERATED', 'DEFECTIVE', 'CORRECTED'];

  if (showJsonStates.includes(state)) {
    return (
      <div className="data-tab">
        <h2>Données du Monstre</h2>
        <pre>{JSON.stringify(monster?.monster_data, null, 2)}</pre>
      </div>
    );
  }

  // Les autres états seront traités dans les étapes suivantes
  const [subTab, setSubTab] = React.useState('interpreted');

  // Pour les états autres que GENERATED, DEFECTIVE, CORRECTED
  const isPendingReview = state === 'PENDING_REVIEW';
  const [editMode, setEditMode] = React.useState(false);
  const [editData, setEditData] = React.useState(monster?.monster_data || {});

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Pour le JSON, on modifie le texte brut
  const handleJsonChange = (e) => {
    try {
      setEditData(JSON.parse(e.target.value));
    } catch {
      // ignore parse error
    }
  };

  // Fonction récursive pour afficher joliment les objets et tableaux imbriqués
  const renderRecursive = (data, level = 0) => {
    if (Array.isArray(data)) {
      return (
        <ul style={{ marginLeft: level * 20 }}>
          {data.map((item, idx) => (
            <li key={idx}>{renderRecursive(item, level + 1)}</li>
          ))}
        </ul>
      );
    } else if (typeof data === 'object' && data !== null) {
      return (
        <ul style={{ marginLeft: level * 20 }}>
          {Object.entries(data).map(([key, value]) => (
            <li key={key}>
              <strong>{key} :</strong>{' '}
              {typeof value === 'object' && value !== null
                ? renderRecursive(value, level + 1)
                : value?.toString()}
            </li>
          ))}
        </ul>
      );
    } else {
      return <span>{data?.toString()}</span>;
    }
  };

  return (
    <div className="data-tab">
      <h2>Données du Monstre</h2>
      <div className="sub-tabs">
        <button
          className={subTab === 'json' ? 'active' : ''}
          onClick={() => setSubTab('json')}
        >
          Visionner (JSON)
        </button>
        <button
          className={subTab === 'interpreted' ? 'active' : ''}
          onClick={() => setSubTab('interpreted')}
        >
          Interpréter
        </button>
      </div>
      {isPendingReview && (
        <div className="edit-toggle">
          <button onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Mode visionnage' : 'Mode modification'}
          </button>
        </div>
      )}
      <div className="sub-tab-content">
        {subTab === 'json' ? (
          editMode && isPendingReview ? (
            <textarea
              value={JSON.stringify(editData, null, 2)}
              onChange={handleJsonChange}
              rows={10}
              style={{ width: '100%' }}
            />
          ) : (
            <pre>
              {JSON.stringify(
                isPendingReview ? editData : monster?.monster_data,
                null,
                2
              )}
            </pre>
          )
        ) : editMode && isPendingReview ? (
          <div>
            <ul>
              {editData &&
                Object.entries(editData).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key} :</strong>
                    <input
                      name={key}
                      value={
                        typeof value === 'object'
                          ? JSON.stringify(value)
                          : value
                      }
                      onChange={handleChange}
                    />
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <div>
            {renderRecursive(
              isPendingReview ? editData : monster?.monster_data
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonsterDataTab;
