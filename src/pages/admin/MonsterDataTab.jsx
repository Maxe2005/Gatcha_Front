import React from 'react';
import './MonsterDataTab.css';

const MonsterDataTab = ({ monster }) => {
  const state = monster?.metadata?.state;
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

  // Fonction récursive pour mettre à jour une valeur dans un objet imbriqué
  const setValueAtPath = (obj, path, value) => {
    if (path.length === 1) {
      return { ...obj, [path[0]]: value };
    }
    const [head, ...rest] = path;
    return {
      ...obj,
      [head]: setValueAtPath(obj[head] || {}, rest, value),
    };
  };

  // Fonction pour gérer le changement d'une valeur imbriquée
  const handleRecursiveChange = (path, newValue) => {
    setEditData((prev) => setValueAtPath(prev, path, newValue));
  };

  // Pour le JSON, on modifie le texte brut
  const handleJsonChange = (e) => {
    try {
      setEditData(JSON.parse(e.target.value));
    } catch {
      // ignore parse error
    }
  };

  // Fonction récursive pour afficher ou éditer les objets et tableaux imbriqués
  const renderRecursive = (data, level = 0, path = []) => {
    if (Array.isArray(data)) {
      return (
        <ul style={{ marginLeft: level * 16 }}>
          {data.map((item, idx) => (
            <li key={idx}>
              <strong>[{idx}] :</strong>{' '}
              {editMode && isPendingReview ? (
                typeof item === 'object' && item !== null ? (
                  renderRecursive(item, level + 1, [...path, idx])
                ) : (
                  <input
                    value={item}
                    onChange={(e) =>
                      handleRecursiveChange([...path, idx], e.target.value)
                    }
                    style={{ width: `${String(item).length + 2}ch` }}
                  />
                )
              ) : typeof item === 'object' && item !== null ? (
                renderRecursive(item, level + 1, [...path, idx])
              ) : (
                item?.toString()
              )}
            </li>
          ))}
        </ul>
      );
    } else if (typeof data === 'object' && data !== null) {
      return (
        <ul style={{ marginLeft: level * 16 }}>
          {Object.entries(data).map(([key, value]) => (
            <li key={key}>
              <strong>{key} :</strong>{' '}
              {editMode && isPendingReview ? (
                typeof value === 'object' && value !== null ? (
                  renderRecursive(value, level + 1, [...path, key])
                ) : (
                  <input
                    name={key}
                    value={value}
                    onChange={(e) =>
                      handleRecursiveChange([...path, key], e.target.value)
                    }
                    style={{ width: `${String(value).length + 2}ch` }}
                  />
                )
              ) : typeof value === 'object' && value !== null ? (
                renderRecursive(value, level + 1, [...path, key])
              ) : (
                value?.toString()
              )}
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
        ) : (
          <div>
            {renderRecursive(
              isPendingReview ? editData : monster?.monster_data,
              0
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonsterDataTab;
