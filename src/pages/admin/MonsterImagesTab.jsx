import React, { useState, useMemo } from 'react';

const MonsterImagesTab = ({
  defaultImage,
  monsterImages = [],
  isSettingDefault,
  setDefaultError,
  handleSetDefaultImage,
  newImagePrompt,
  setNewImagePrompt,
  handleGenerateImage,
  isGeneratingImage,
  generateError,
}) => {
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
                onClick={(e) => {
                  const img = e.target;
                  if (img.style.transform) {
                    img.style.transform = '';
                    img.style.cursor = 'zoom-in';
                  } else {
                    img.style.transform = 'scale(2)';
                    img.style.cursor = 'zoom-out';
                  }
                }}
              />
              <div
                style={{
                  color: '#fff',
                  marginTop: 8,
                  textAlign: 'center',
                  fontSize: 14,
                }}
              >
                Cliquez sur l&apos;image pour zoomer
              </div>
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
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                  {selectedImage.image_name}
                </div>
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
        onSubmit={(e) => {
          e.preventDefault();
          let name = newImageName.trim();
          if (!name) {
            // Génère un nom unique par défaut
            let base = 'image_' + (monsterImages.length + 1);
            let existingNames = monsterImages.map((img) => img.image_name);
            let i = 1;
            name = base;
            while (existingNames.includes(name)) {
              name = base + '_' + i;
              i++;
            }
            setNewImageName(name);
          }
          handleGenerateImage({
            prompt: newImagePrompt,
            image_name: name,
          });
        }}
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
        {generateError && (
          <span style={{ color: 'red', fontSize: 13 }}>{generateError}</span>
        )}
      </form>
    </div>
  );
};

export default MonsterImagesTab;
