// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useEffect, useState } from 'react';
import { adminApiService } from '../../../../services/adminService';
import './MonsterDataTab.css';
import { DynamicField } from '../../../../components/DynamicField';
import { useAuth } from '../../../../context/AuthContext';

const MonsterDataTab = ({
  monster,
  monsterId,
  targetField,
  onMonsterUpdate,
  onActionError,
  onTargetFieldCleared,
}) => {
  const { user } = useAuth();
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
  const [showValidationErrors, setShowValidationErrors] = useState(true);

  useEffect(() => {
    setEditData(monster?.monster_data || {});
    setJsonText(JSON.stringify(monster?.monster_data || {}, null, 2));
    setJsonError(null);
    setUpdateNotes('');
    setSkipValidation(false);
    setEditMode(false);
  }, [monster]);

  // Gérer la navigation vers un champ spécifique
  useEffect(() => {
    if (targetField && canEdit) {
      // Activer le mode édition
      setEditMode(true);
      // Basculer vers l'onglet interprété pour voir les champs
      setSubTab('interpreted');
      setShowValidationErrors(true);
    }
  }, [targetField, canEdit]);

  // Effet séparé pour le scroll après que le DOM soit mis à jour
  useEffect(() => {
    if (targetField && subTab === 'interpreted') {
      // Attendre que le rendu soit complètement terminé
      const scrollToField = () => {
        const fieldId = `field-${targetField}`;
        const element = document.getElementById(fieldId);

        if (element) {
          // Scroller la page principale vers l'élément
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });

          // Ajouter une classe pour animation temporaire après le scroll
          setTimeout(() => {
            element.classList.add('field-highlighted');
            setTimeout(() => {
              element.classList.remove('field-highlighted');
            }, 3000);
          }, 400);

          // Nettoyer le targetField après navigation
          if (onTargetFieldCleared) {
            setTimeout(() => {
              onTargetFieldCleared();
            }, 800);
          }
        } else {
          console.warn('Élément non trouvé pour le champ:', targetField);
          // Lister tous les IDs disponibles pour debug
          const allFields = document.querySelectorAll('[id^="field-"]');
          console.log(
            'Champs disponibles:',
            Array.from(allFields).map((el) => el.id)
          );
        }
      };

      // Utiliser requestAnimationFrame pour s'assurer que le DOM est bien rendu
      requestAnimationFrame(() => {
        setTimeout(scrollToField, 100);
      });
    }
  }, [targetField, subTab, onTargetFieldCleared]);

  const getValueType = (value) => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  };

  const getformatPathString = (path) => {
    let pathString = '';
    for (const segment of path) {
      if (typeof segment === 'number') {
        pathString += `[${segment}]`;
      } else {
        if (pathString) pathString += '.';
        pathString += segment;
      }
    }
    return pathString;
  };

  // Fonction pour obtenir l'erreur de validation pour un champ donné
  const getValidationError = (path) => {
    if (!showValidationErrors || !monster?.metadata?.validation_errors) {
      return null;
    }
    const pathString = getformatPathString(path);
    return monster.metadata.validation_errors.find(
      (error) => error.field === pathString
    );
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
      await adminApiService.updateMonster(
        monsterId,
        user?.username || 'Admin',
        editData,
        {
          skipValidation,
          notes: updateNotes || null,
        }
      );
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
          {data.map((item, idx) => {
            const currentPath = [...path, idx];
            const validationError = getValidationError(currentPath);
            const pathString = getformatPathString(currentPath);
            return (
              <li
                key={idx}
                id={`field-${pathString}`}
                className={validationError ? 'field-with-error' : ''}
              >
                <strong>[{idx}] :</strong> <br />
                {editMode && canEdit ? (
                  typeof item === 'object' && item !== null ? (
                    renderRecursive(item, level + 1, currentPath)
                  ) : (
                    <>
                      <DynamicField
                        type={typeof item === 'number' ? 'number' : 'text'}
                        value={item}
                        onChange={(e) => {
                          const valueType = getValueType(item);
                          handleRecursiveChange(
                            currentPath,
                            e.target.value,
                            valueType
                          );
                        }}
                      />
                      {validationError && (
                        <div className="validation-error-message">
                          ⚠️ {validationError.message}
                        </div>
                      )}
                    </>
                  )
                ) : typeof item === 'object' && item !== null ? (
                  renderRecursive(item, level + 1, currentPath)
                ) : (
                  <>
                    <span className={validationError ? 'error-value' : ''}>
                      {item?.toString()}
                    </span>
                    {validationError && (
                      <div className="validation-error-message">
                        ⚠️ {validationError.message}
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      );
    } else if (typeof data === 'object' && data !== null) {
      return (
        <ul style={{ marginLeft: level * 36 }}>
          {Object.entries(data).map(([key, value]) => {
            const currentPath = [...path, key];
            const validationError = getValidationError(currentPath);
            const pathString = getformatPathString(currentPath);
            return (
              <li
                key={key}
                id={`field-${pathString}`}
                className={validationError ? 'field-with-error' : ''}
              >
                <strong>{key} :</strong>{' '}
                {editMode && canEdit ? (
                  typeof value === 'object' && value !== null ? (
                    renderRecursive(value, level + 1, currentPath)
                  ) : (
                    <>
                      <DynamicField
                        type={typeof value === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={(e) => {
                          const valueType = getValueType(value);
                          handleRecursiveChange(
                            currentPath,
                            e.target.value,
                            valueType
                          );
                        }}
                      />
                      {validationError && (
                        <div className="validation-error-message">
                          ⚠️ {validationError.message}
                        </div>
                      )}
                    </>
                  )
                ) : typeof value === 'object' && value !== null ? (
                  renderRecursive(value, level + 1, currentPath)
                ) : (
                  <>
                    <span className={validationError ? 'error-value' : ''}>
                      {value?.toString()}
                    </span>
                    {validationError && (
                      <div className="validation-error-message">
                        ⚠️ {validationError.message}
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
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
        <div className="data-tab-header-actions">
          {monster?.metadata?.validation_errors?.length > 0 && (
            <button
              className="btn-toggle-errors"
              onClick={() => setShowValidationErrors(!showValidationErrors)}
              title={
                showValidationErrors
                  ? 'Masquer les erreurs'
                  : 'Afficher les erreurs'
              }
            >
              {showValidationErrors ? '🔴' : '⚪'}
            </button>
          )}
          {canEdit && (
            <div className="edit-toggle">
              <button onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Mode visionnage' : 'Mode modification'}
              </button>
            </div>
          )}
        </div>
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
