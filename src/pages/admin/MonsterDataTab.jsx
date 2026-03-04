import React, { useEffect, useState } from 'react';
import { adminApiService } from '../../services/adminService';
import './MonsterDataTab.css';
import { DynamicField } from '../../components/DynamicField';

const MonsterDataTab = ({
  monster,
  monsterId,
  onMonsterUpdate,
  onActionError,
}) => {
  const state = monster?.metadata?.state;
  const canEditStates = ['GENERATED', 'PENDING_REVIEW', 'DEFECTIVE'];
  const canEdit = canEditStates.includes(state);
  const [subTab, setSubTab] = useState('interpreted');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(monster?.monster_data || {});
  const [jsonText, setJsonText] = useState(
    JSON.stringify(monster?.monster_data || {}, null, 2)
  );
  const [jsonError, setJsonError] = useState(null);
  const [skipValidation, setSkipValidation] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditData(monster?.monster_data || {});
    setJsonText(JSON.stringify(monster?.monster_data || {}, null, 2));
    setJsonError(null);
    setUpdateNotes('');
    setSkipValidation(false);
    setEditMode(false);
  }, [monster]);

  useEffect(() => {
    if (!editMode || subTab !== 'json') {
      setJsonText(JSON.stringify(editData || {}, null, 2));
    }
  }, [editData, editMode, subTab]);

  // Fonction pour déterminer le type original d'une valeur
  const getValueType = (value) => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  };

  // Fonction pour convertir une value au bon type
  const convertValueToType = (value, originalType) => {
    if (originalType === 'number') {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    }
    if (originalType === 'boolean') {
      return String(value).toLowerCase() === 'true';
    }
    return String(value);
  };

  // Fonction récursive pour mettre à jour une valeur dans un objet imbriqué
  const setValueAtPath = (obj, path, value) => {
    const [head, ...rest] = path;

    // Cas de base : on est arrivé à la fin du chemin
    if (path.length === 1) {
      if (Array.isArray(obj)) {
        const newArray = [...obj];
        newArray[head] = value;
        return newArray;
      }
      return { ...obj, [head]: value };
    }

    // Cas récursif : on descend plus profondément
    const currentValue = obj[head] || (typeof head === 'number' ? [] : {});
    const updatedValue = setValueAtPath(currentValue, rest, value);

    if (Array.isArray(obj)) {
      const newArray = [...obj];
      newArray[head] = updatedValue;
      return newArray;
    }

    return {
      ...obj,
      [head]: updatedValue,
    };
  };

  // Fonction pour gérer le changement d'une valeur imbriquée
  const handleRecursiveChange = (path, newValue, originalType = 'string') => {
    const convertedValue = convertValueToType(newValue, originalType);
    setEditData((prev) => setValueAtPath(prev, path, convertedValue));
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
        <ul style={{ marginLeft: level * 36 }}>
          {data.map((item, idx) => (
            <li key={idx}>
              <strong>[{idx}] :</strong> <br />
              {editMode && canEdit ? (
                typeof item === 'object' && item !== null ? (
                  renderRecursive(item, level + 1, [...path, idx])
                ) : (
                  <DynamicField
                    type={typeof item === 'number' ? 'number' : 'text'}
                    value={item}
                    onChange={(e) => {
                      const valueType = getValueType(item);
                      handleRecursiveChange(
                        [...path, idx],
                        e.target.value,
                        valueType
                      );
                    }}
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
        <ul style={{ marginLeft: level * 36 }}>
          {Object.entries(data).map(([key, value]) => (
            <li key={key}>
              <strong>{key} :</strong>{' '}
              {editMode && canEdit ? (
                typeof value === 'object' && value !== null ? (
                  renderRecursive(value, level + 1, [...path, key])
                ) : (
                  <DynamicField
                    type={typeof value === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(e) => {
                      const valueType = getValueType(value);
                      handleRecursiveChange(
                        [...path, key],
                        e.target.value,
                        valueType
                      );
                    }}
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
