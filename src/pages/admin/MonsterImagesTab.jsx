import React, { useState, useMemo, useRef, useEffect } from 'react';

import { adminApiService } from '../../services/adminService';
import {
  initiateImageGeneration,
  trackImageGeneration,
} from '../../services/api';

const MonsterImagesTab = ({
  monsterId,
  monster,
  defaultImage,
  monsterImages = [],
  onImagesUpdate,
}) => {
  // États internes pour la gestion des actions
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [setDefaultError, setSetDefaultError] = useState(null);
  const [newImagePrompt, setNewImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [isRenamingImage, setIsRenamingImage] = useState(false);
  const [renameError, setRenameError] = useState(null);
  const [editingImageName, setEditingImageName] = useState(null);

  // États pour la génération asynchrone avec WebSocket
  const [imageGenerationProgress, setImageGenerationProgress] = useState(null);
  const wsRefImage = useRef(null);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRefImage.current && wsRefImage.current.readyState === 1) {
        wsRefImage.current.close();
      }
    };
  }, []);

  // Définir une image comme image par défaut
  const handleSetDefaultImage = async (imageId) => {
    setIsSettingDefault(true);
    setSetDefaultError(null);
    try {
      await adminApiService.setMonsterDefaultImage(monsterId, imageId);
      // Refresh images
      const imagesRes = await adminApiService.getMonsterImages(monsterId);
      onImagesUpdate(imagesRes);
    } catch (err) {
      setSetDefaultError(
        err.response?.data?.detail ||
          "Erreur lors du changement d'image par défaut"
      );
    } finally {
      setIsSettingDefault(false);
    }
  };

  // Renommer une image
  const handleRenameImage = async (imageId, newName) => {
    if (!newName || newName.trim() === selectedImage.image_name) {
      setEditingImageName(null);
      return;
    }

    setIsRenamingImage(true);
    setRenameError(null);
    try {
      await adminApiService.renameMonsterImage(monsterId, imageId, newName);

      // Refresh images
      const imagesRes = await adminApiService.getMonsterImages(monsterId);
      onImagesUpdate(imagesRes);
      setEditingImageName(null);
    } catch (err) {
      setRenameError(
        err.response?.data?.detail || "Erreur lors du renommage de l'image"
      );
    } finally {
      setIsRenamingImage(false);
    }
  };

  // Génération d'une nouvelle image - ASYNC avec WebSocket
  const handleGenerateImage = async (e) => {
    e.preventDefault();
    setIsGeneratingImage(true);
    setGenerateError(null);
    setImageGenerationProgress(null);

    try {
      // Étape 1: Initier la génération (retourne batch_id)
      const result = await initiateImageGeneration(
        monster?.metadata?.monster_id,
        newImageName ||
          monster?.monster_data?.name ||
          monster?.monster_data?.nom ||
          'image',
        newImagePrompt
      );

      if (!result.batch_id) {
        throw new Error('Réponse inattendue du serveur (pas de batch_id)');
      }

      setImageGenerationProgress({ status: 'Génération lancée...' });

      // Étape 2: Tracker la génération en temps réel via WebSocket
      return new Promise((resolve, reject) => {
        const ws = trackImageGeneration(
          result.batch_id,
          (progress) => {
            // Mise à jour du UI avec la progression
            setImageGenerationProgress(progress);
          },
          (result) => {
            // Génération terminée
            setIsGeneratingImage(false);
            setImageGenerationProgress(null);
            setNewImagePrompt('');
            setNewImageName('');

            // Refresh images
            adminApiService
              .getMonsterImages(monsterId)
              .then((imagesRes) => {
                onImagesUpdate(imagesRes);
                resolve(result);
              })
              .catch((err) => {
                setGenerateError(
                  'Erreur lors de la récupération des images actualisées'
                );
                reject(err);
              });
          },
          (error) => {
            // Erreur durant la génération
            setIsGeneratingImage(false);
            setImageGenerationProgress(null);
            setGenerateError(`Erreur: ${error.error}`);
            reject(error);
          }
        );
        wsRefImage.current = ws;
      });
    } catch (err) {
      setIsGeneratingImage(false);
      setImageGenerationProgress(null);
      setGenerateError(
        err?.response?.data?.detail ||
          err.message ||
          "Erreur lors de la génération de l'image"
      );
    }
  };
  // Ajout du champ image_name
  const [newImageName, setNewImageName] = useState(() => {
    // Génère un nom unique par défaut
    let base = 'image_' + (monsterImages.length + 1);
    let existingNames = monsterImages.map((img) => img.image_name);
    let i = 1;
    let name = base;
    while (existingNames.includes(name)) {
      name = base + '_' + i;
      i++;
    }
    return name;
  });

  // Fonction pour charger un prompt existant
  const handleLoadPrompt = (prompt) => {
    setNewImagePrompt(prompt);
  };
  // Sélection de l'image courante
  const [selectedImageId, setSelectedImageId] = useState(
    defaultImage?.id || (monsterImages[0]?.id ?? null)
  );

  const selectedImage = useMemo(
    () =>
      monsterImages.find((img) => img.id === selectedImageId) || defaultImage,
    [selectedImageId, monsterImages, defaultImage]
  );

  return (
    <div className="images-tab" style={{ width: '100%', height: '100%' }}>
      <h2>Images du Monstre</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 32,
          alignItems: 'flex-start',
          width: '100%',
          minHeight: 500,
        }}
      >
        {/* Partie gauche : image sélectionnée */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minWidth: 0,
            maxWidth: '50%',
          }}
        >
          {selectedImage ? (
            <div
              style={{
                width: '100%',
                maxWidth: 600,
                background: '#222',
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 8,
                overflow: 'auto',
              }}
            >
              <img
                src={selectedImage.image_url}
                alt={selectedImage.image_name || 'Image du monstre'}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 600,
                  cursor: 'zoom-in',
                  borderRadius: 4,
                }}
                draggable={false}
              />
            </div>
          ) : (
            <div style={{ color: '#888', fontSize: 16 }}>
              Aucune image sélectionnée
            </div>
          )}
        </div>

        {/* Partie droite : gestion et sélection */}
        <div
          style={{
            flex: 1.2,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Liste horizontale de sélection */}
          <div style={{ width: '100%', overflowX: 'auto', marginBottom: 8 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 16,
                alignItems: 'flex-end',
                minHeight: 120,
                paddingBottom: 8,
              }}
            >
              {monsterImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImageId(img.id)}
                  style={{
                    border:
                      img.id === selectedImageId
                        ? '3px solid #1976d2'
                        : img.is_default
                          ? '2px solid #4caf50'
                          : '1px solid #888',
                    borderRadius: 8,
                    background: '#222',
                    padding: 6,
                    minWidth: 100,
                    maxWidth: 120,
                    cursor: 'pointer',
                    boxShadow:
                      img.id === selectedImageId ? '0 0 8px #1976d2' : 'none',
                    position: 'relative',
                    transition: 'border 0.2s',
                  }}
                >
                  <img
                    src={img.image_url}
                    alt={img.image_name}
                    style={{
                      width: '100%',
                      aspectRatio: '2/3',
                      height: 'auto',
                      maxHeight: 180,
                      objectFit: 'cover',
                      borderRadius: 4,
                      background: '#111',
                    }}
                  />
                  {img.is_default && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        background: '#4caf50',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                      }}
                    >
                      Défaut
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Détails de l'image sélectionnée */}
          <div
            style={{
              background: '#181818',
              borderRadius: 8,
              padding: 16,
              border: '1px solid #333',
              minHeight: 120,
            }}
          >
            {selectedImage ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  {editingImageName !== null ? (
                    <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                      <input
                        type="text"
                        defaultValue={selectedImage.image_name}
                        onChange={(e) => setEditingImageName(e.target.value)}
                        placeholder="Nouveau nom"
                        autoFocus
                        style={{
                          flex: 1,
                          borderRadius: 4,
                          padding: 6,
                          fontSize: 14,
                          border: '1px solid #555',
                          background: '#222',
                          color: '#fff',
                        }}
                      />
                      <button
                        className="btn-primary"
                        style={{ fontSize: 12, padding: '6px 12px' }}
                        disabled={isRenamingImage}
                        onClick={() =>
                          handleRenameImage(selectedImage.id, editingImageName)
                        }
                      >
                        {isRenamingImage ? 'Enregistrement...' : 'Valider'}
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={() => setEditingImageName(null)}
                        disabled={isRenamingImage}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          color: '#fff',
                          fontSize: 16,
                          fontWeight: 600,
                          flex: 1,
                        }}
                      >
                        {selectedImage.image_name}
                      </div>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={() =>
                          setEditingImageName(selectedImage.image_name)
                        }
                      >
                        ✏️ Renommer
                      </button>
                    </>
                  )}
                </div>
                {renameError && (
                  <div style={{ color: 'red', marginBottom: 8, fontSize: 12 }}>
                    {renameError}
                  </div>
                )}
                <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>
                  {selectedImage.prompt}
                </div>
                <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                  Créée le :{' '}
                  {new Date(selectedImage.created_at).toLocaleString('fr-FR')}
                </div>
                <div style={{ marginTop: 12 }}>
                  {selectedImage.is_default ? (
                    <span
                      style={{
                        color: '#4caf50',
                        fontWeight: 500,
                        fontSize: 13,
                      }}
                    >
                      Image par défaut
                    </span>
                  ) : (
                    <button
                      className="btn-secondary"
                      style={{ fontSize: 13, padding: '4px 12px' }}
                      disabled={isSettingDefault}
                      onClick={() => handleSetDefaultImage(selectedImage.id)}
                    >
                      {isSettingDefault
                        ? 'Définition...'
                        : 'Définir comme défaut'}
                    </button>
                  )}
                </div>
                {setDefaultError && (
                  <div style={{ color: 'red', marginTop: 8 }}>
                    {setDefaultError}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: '#888' }}>Aucune image sélectionnée</div>
            )}
          </div>
        </div>
      </div>
      {/* Génération d'une nouvelle image */}
      <form
        onSubmit={handleGenerateImage}
        style={{
          marginTop: 24,
          width: '100%',
          background: '#181818',
          borderRadius: 8,
          padding: 16,
          border: '1px solid #333',
        }}
      >
        <h3 style={{ color: '#fff', marginBottom: 8 }}>
          Générer une nouvelle image
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            marginBottom: 8,
          }}
        >
          <label style={{ color: '#fff', fontSize: 13, marginBottom: 2 }}>
            Nom de l&apos;image
          </label>
          <input
            type="text"
            value={newImageName}
            onChange={(e) => setNewImageName(e.target.value)}
            placeholder="Nom de l'image (optionnel)"
            style={{
              borderRadius: 4,
              padding: 8,
              fontSize: 14,
              border: '1px solid #444',
              background: '#222',
              color: '#fff',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            marginBottom: 8,
          }}
        >
          <label style={{ color: '#fff', fontSize: 13, marginBottom: 2 }}>
            Prompt
          </label>
          <textarea
            value={newImagePrompt}
            ref={(el) => {
              if (el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
            onChange={(e) => {
              setNewImagePrompt(e.target.value);
            }}
            placeholder="Prompt personnalisé pour l'image..."
            rows={3}
            style={{
              width: '100%',
              borderRadius: 4,
              padding: 8,
              fontSize: 14,
              resize: 'none',
              overflow: 'hidden',
              minHeight: 48,
              boxSizing: 'border-box',
            }}
            required
          />
        </div>
        {/* Charger un prompt existant */}
        {monsterImages.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <label style={{ color: '#fff', fontSize: 13 }}>
              Charger un prompt existant :
            </label>
            <select
              style={{
                marginLeft: 8,
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 13,
              }}
              onChange={(e) => {
                const idx = e.target.value;
                if (idx !== '') handleLoadPrompt(monsterImages[idx].prompt);
              }}
              defaultValue=""
            >
              <option value="">-- Choisir une image --</option>
              {monsterImages.map((img, idx) => (
                <option key={img.id} value={idx}>
                  {img.image_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={isGeneratingImage || !newImagePrompt}
        >
          {isGeneratingImage ? 'Génération...' : 'Générer'}
        </button>

        {/* Affichage de la progression */}
        {imageGenerationProgress && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              background: '#222',
              borderRadius: 4,
              border: '1px solid #444',
              color: '#aaa',
              fontSize: 13,
            }}
          >
            {imageGenerationProgress.status && (
              <div style={{ marginBottom: 8 }}>
                <strong>Status:</strong> {imageGenerationProgress.status}
              </div>
            )}
            {imageGenerationProgress.info && (
              <div style={{ marginBottom: 8 }}>
                <strong>Info:</strong> {imageGenerationProgress.info}
              </div>
            )}
            {imageGenerationProgress.image && (
              <div>
                <strong>Image générée avec succès!</strong>
              </div>
            )}
          </div>
        )}

        {generateError && (
          <span
            style={{
              color: 'red',
              fontSize: 13,
              marginTop: 8,
              display: 'block',
            }}
          >
            {generateError}
          </span>
        )}
      </form>
    </div>
  );
};

export default MonsterImagesTab;
