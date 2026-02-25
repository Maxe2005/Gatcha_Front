import React from 'react';
import { adminApiService } from '../../services/adminService';
import './MonsterDataTab.css';

const MonsterDataTab = ({
  monster,
  monsterId,
  onMonsterUpdate,
  onActionError,
}) => {
  const state = monster?.metadata?.state;
  const canEditStates = ['GENERATED', 'PENDING_REVIEW', 'DEFECTIVE'];
  const canEdit = canEditStates.includes(state);
  const [subTab, setSubTab] = React.useState('interpreted');
  const [editMode, setEditMode] = React.useState(false);
  const [editData, setEditData] = React.useState(monster?.monster_data || {});
  const [jsonText, setJsonText] = React.useState(
    JSON.stringify(monster?.monster_data || {}, null, 2)
  );
  const [jsonError, setJsonError] = React.useState(null);
  const [skipValidation, setSkipValidation] = React.useState(false);
  const [updateNotes, setUpdateNotes] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setEditData(monster?.monster_data || {});
    setJsonText(JSON.stringify(monster?.monster_data || {}, null, 2));
    setJsonError(null);
    setUpdateNotes('');
    setSkipValidation(false);
    setEditMode(false);
  }, [monster]);

  React.useEffect(() => {
    if (!editMode || subTab !== 'json') {
      setJsonText(JSON.stringify(editData || {}, null, 2));
    }
  }, [editData, editMode, subTab]);

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
    const nextValue = e.target.value;
    setJsonText(nextValue);
    try {
      const parsed = JSON.parse(nextValue);
      setEditData(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError(error.message || 'JSON invalide');
    }
  };

  const handleSave = async () => {
    if (!canEdit || !editMode) return;
    if (subTab === 'json' && jsonError) {
      onActionError?.('JSON invalide. Corrigez avant de sauvegarder.');
      return;
    }
    try {
      setIsSaving(true);
      onActionError?.(null);
      await adminApiService.updateMonster(monsterId, editData, {
        skipValidation,
        notes: updateNotes || null,
      });
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      onMonsterUpdate?.(detail, history.history || []);
      setEditMode(false);
      setJsonText(JSON.stringify(detail?.monster_data || {}, null, 2));
      alert('Modifications enregistrees avec succes');
    } catch (err) {
      onActionError?.(
        err.response?.data?.detail || 'Erreur lors de la mise a jour du monstre'
      );
    } finally {
      setIsSaving(false);
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
              {editMode && canEdit ? (
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
              {editMode && canEdit ? (
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
      <div className="data-tab-header">
        <h2>Données du Monstre</h2>
        {canEdit && (
          <div className="edit-toggle">
            <button onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Mode visionnage' : 'Mode modification'}
            </button>
          </div>
        )}
      </div>
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
      <div className="sub-tab-content">
        {subTab === 'json' ? (
          editMode && canEdit ? (
            <textarea
              value={jsonText}
              onChange={handleJsonChange}
              rows={10}
              style={{ width: '100%' }}
            />
          ) : (
            <pre>
              {JSON.stringify(
                editMode && canEdit ? editData : monster?.monster_data,
                null,
                2
              )}
            </pre>
          )
        ) : (
          <div>
            {renderRecursive(
              editMode && canEdit ? editData : monster?.monster_data,
              0
            )}
          </div>
        )}
      </div>
      {editMode && canEdit && (
        <div className="data-tab-actions">
          <div className="data-tab-controls">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={skipValidation}
                onChange={(e) => setSkipValidation(e.target.checked)}
              />
              Forcer la mise a jour (skip validation)
            </label>
            <textarea
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="Notes de modification (optionnel)"
              rows={2}
            />
            {jsonError && <div className="json-error">{jsonError}</div>}
          </div>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MonsterDataTab;
