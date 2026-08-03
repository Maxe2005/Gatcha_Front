// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  generateMonster,
  generateMonsterBatch,
} from '../../../services/generationService';
import {
  notifySuccess,
  notifyError,
  notifyInfo,
  notifyLoading,
  dismissToast,
} from '../../../services/notificationService';
import { useTheme } from '../../../context/ThemeContext';
import './GenerateMonsters.css';

const GenerateMonsters = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [batchCount, setBatchCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMonsters, setGeneratedMonsters] = useState([]);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pendingBatch, setPendingBatch] = useState(null); // { prompt, batchCount, startedAt, batchId }
  const wsRef = useRef(null);

  const isMountedRef = useRef(true);
  const pageRef = useRef(null);

  // Déclencher l'animation de transition lors du changement de thème
  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.classList.add('theme-switching');
      const timer = setTimeout(() => {
        if (pageRef.current) {
          pageRef.current.classList.remove('theme-switching');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [theme]);

  // Gestion du flag "génération en cours" dans le localStorage
  useEffect(() => {
    // Nettoyage du ref
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Au chargement, vérifier s'il y a une génération en cours (persistée)
  useEffect(() => {
    const pending = localStorage.getItem('monsterBatchPending');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        setPendingBatch(parsed);
        setPrompt(parsed.prompt);
        setBatchCount(parsed.batchCount);
        setIsLoading(true);
        setStartTime(parsed.startedAt);
      } catch {
        localStorage.removeItem('monsterBatchPending');
      }
    }
  }, []);

  // Timer pour le temps écoulé
  useEffect(() => {
    if (!isLoading || !startTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, startTime]);

  // Suivi WebSocket (sera branché après POST)
  useEffect(() => {
    if (!pendingBatch || !pendingBatch.batchId) return;
    let isClosed = false;
    const monsters = [];
    const ws = new window.WebSocket(
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://localhost:8000/api/v1/monsters/ws/${pendingBatch.batchId}`
    );
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.success) {
          setIsLoading(false);
          setPendingBatch(null);
          localStorage.removeItem('monsterBatchPending');
          notifySuccess(
            `${monsters.length} monstre(s) généré(s) avec succès !`,
            20000
          );
          ws.close();
          isClosed = true;
        } else if (data.error) {
          const errorMessage = parseErrorMessage(data.error);
          setError(errorMessage);
          notifyError(errorMessage);
          setIsLoading(false);
          setPendingBatch(null);
          localStorage.removeItem('monsterBatchPending');
          if (!isClosed) ws.close();
        } else if (data.info) {
          notifyInfo(data.info, 20000);
        } else if (data.monster) {
          const monster = data.monster;
          monsters.push(monster);
          setGeneratedMonsters((prev) => [...prev, monster]);

          notifySuccess(`Monstre généré : ${monster.nom || 'Inconnu'}`, 20000);
        }
      } catch {
        // ignore parse error
      }
    };
    ws.onerror = () => {
      setError('Erreur WebSocket lors du suivi de la génération.');
      setIsLoading(false);
      setPendingBatch(null);
      localStorage.removeItem('monsterBatchPending');
      if (!isClosed) ws.close();
    };
    return () => {
      if (ws && ws.readyState === 1) ws.close();
    };
  }, [pendingBatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const parseErrorMessage = (errorMsg) => {
    if (!errorMsg) return 'Une erreur inconnue est survenue';

    // If it's a simple string, return it
    if (typeof errorMsg === 'string') {
      return errorMsg;
    }

    // Try to extract meaningful error message
    const str = String(errorMsg);
    const lines = str.split('\n');
    return lines[0] || str;
  };

  const handleGenerateSingle = async () => {
    if (!prompt.trim()) {
      notifyError('Veuillez entrer un prompt');
      return;
    }
    if (localStorage.getItem('monsterBatchPending')) {
      notifyError('Une génération de monstres est déjà en cours.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedMonsters([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    const toastId = notifyLoading('Génération du monstre en cours...');
    try {
      const result = await generateMonster(prompt);
      if (result && result.batch_id) {
        const pending = {
          prompt,
          batchCount: 1,
          startedAt: Date.now(),
          batchId: result.batch_id,
        };
        localStorage.setItem('monsterBatchPending', JSON.stringify(pending));
        setPendingBatch(pending);
      } else {
        throw new Error('Réponse inattendue du serveur (pas de batch_id)');
      }
    } catch (err) {
      const errorMessage = parseErrorMessage(err);
      setError(errorMessage);
      notifyError(errorMessage);
      setIsLoading(false);
      setPendingBatch(null);
      localStorage.removeItem('monsterBatchPending');
    } finally {
      dismissToast(toastId);
    }
  };

  const handleGenerateBatch = async () => {
    if (!prompt.trim()) {
      notifyError('Veuillez entrer un prompt');
      return;
    }
    if (batchCount < 1 || batchCount > 10) {
      notifyError('Le nombre de monstres doit être entre 1 et 10');
      return;
    }
    if (localStorage.getItem('monsterBatchPending')) {
      notifyError('Une génération de monstres est déjà en cours.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedMonsters([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    const toastId = notifyLoading(
      `Génération de ${batchCount} monstre(s) en cours...`
    );
    try {
      const result = await generateMonsterBatch(batchCount, prompt);
      if (result && result.batch_id) {
        const pending = {
          prompt,
          batchCount,
          startedAt: Date.now(),
          batchId: result.batch_id,
        };
        localStorage.setItem('monsterBatchPending', JSON.stringify(pending));
        setPendingBatch(pending);
      } else {
        throw new Error('Réponse inattendue du serveur (pas de batch_id)');
      }
    } catch (err) {
      const errorMessage = parseErrorMessage(err);
      setError(errorMessage);
      notifyError(errorMessage);
      setIsLoading(false);
      setPendingBatch(null);
      localStorage.removeItem('monsterBatchPending');
    } finally {
      dismissToast(toastId);
    }
  };

  const getRankColor = (rank) => {
    // Palette de rareté fixe (voir CLAUDE.md), partagée avec
    // GatchaCard/SkillCard/Inventory — pas de hex custom ici.
    const colors = {
      COMMON: 'var(--rank-common-solid)',
      RARE: 'var(--rank-rare-solid)',
      EPIC: 'var(--rank-epic-solid)',
      LEGENDARY: 'var(--rank-legendary-solid)',
    };
    return colors[rank] || 'var(--rank-common-solid)';
  };

  const getElementColor = (element) => {
    // Palette d'élément fixe (voir CLAUDE.md), partagée avec
    // GatchaCard/AdminMonstersList/Inventory — pas de hex custom ici.
    const colors = {
      FIRE: 'var(--element-fire)',
      WATER: 'var(--element-water)',
      WIND: 'var(--element-wind)',
      EARTH: 'var(--element-earth)',
      LIGHT: 'var(--element-light)',
      DARKNESS: 'var(--element-darkness)',
    };
    return colors[element?.toUpperCase()] || 'var(--element-neutre)';
  };

  return (
    <div className={`generate-page theme-${theme}`} ref={pageRef}>
      <div className="generate-container">
        {/* Bouton retour dashboard */}
        <button
          type="button"
          className="generate-back-btn"
          onClick={() => navigate('/admin')}
        >
          ← Retour au Dashboard
        </button>

        {/* Form Section */}
        <div className="generate-form-panel">
          <h1 className="generate-form-title">✨ Générateur de Monstres</h1>
          <p className="generate-form-description">
            Utilisez votre créativité pour créer de nouveaux monstres ! Entrez
            un prompt décrivant le monstre que vous souhaitez générer. La
            génération peut prendre plusieurs minutes.
          </p>

          <div className="form-group">
            <label htmlFor="generate-prompt">
              Description du monstre (prompt)
            </label>
            <textarea
              id="generate-prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Un bébé dragon d'élément eau avec des écailles bleus et des petites ailes..."
              disabled={isLoading}
            />
          </div>

          <div className="form-group generate-batch-count-group">
            <label htmlFor="generate-batch-count">
              Nombre de monstres à générer (lot)
            </label>
            <input
              id="generate-batch-count"
              type="number"
              min={1}
              max={10}
              value={batchCount}
              onChange={(e) =>
                setBatchCount(
                  Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1))
                )
              }
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="generate-error-alert">
              <p className="generate-error-title">❌ Erreur de génération</p>
              {error.includes('429') ||
              error.includes('RESOURCE_EXHAUSTED') ? (
                <>
                  <p>
                    Le service d&apos;IA est actuellement surchargé. Veuillez
                    réessayer dans quelques instants.
                  </p>
                  <details className="generate-error-details">
                    <summary>Détails techniques</summary>
                    <div className="generate-error-raw">{error}</div>
                  </details>
                </>
              ) : (
                <p>{error}</p>
              )}
            </div>
          )}

          <div className="generate-actions">
            <button
              type="button"
              className="generate-action-btn primary"
              onClick={handleGenerateSingle}
              disabled={isLoading || !prompt.trim() || !!pendingBatch}
            >
              {isLoading ? (
                <span className="generate-btn-spinner" aria-hidden="true" />
              ) : (
                '🎮'
              )}
              Générer 1 Monstre
            </button>
            <button
              type="button"
              className="generate-action-btn secondary"
              onClick={handleGenerateBatch}
              disabled={isLoading || !prompt.trim() || !!pendingBatch}
            >
              {isLoading ? (
                <span className="generate-btn-spinner" aria-hidden="true" />
              ) : (
                '🎲'
              )}
              Générer {batchCount} Monstres
            </button>
          </div>

          {isLoading && (
            <div className="generate-progress">
              <div className="generate-progress-bar">
                <div className="generate-progress-fill" />
              </div>
              <div className="generate-progress-text">
                <p>⏳ Génération en cours... {formatTime(elapsedTime)}</p>
                <p className="generate-progress-hint">
                  Cela peut prendre plusieurs minutes. Vous pouvez naviguer
                  ailleurs, une notification vous avertira quand ce sera
                  terminé.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {generatedMonsters.length > 0 && (
          <div className="generate-results">
            <h2 className="generate-results-title">
              🎉 Monstres Générés ({generatedMonsters.length})
            </h2>

            <div className="generate-results-grid">
              {generatedMonsters.map((monster, idx) => (
                <div
                  key={idx}
                  className="generate-monster-card"
                  style={{ borderColor: getRankColor(monster.rang) }}
                >
                  {/* Image */}
                  {monster.ImageUrl && (
                    <img
                      className="generate-monster-image"
                      src={monster.ImageUrl}
                      alt={monster.nom}
                    />
                  )}

                  <div className="generate-monster-content">
                    {/* Name & Rank */}
                    <div className="generate-monster-header">
                      <h3>{monster.nom}</h3>
                      <span
                        className="generate-badge"
                        style={{ backgroundColor: getRankColor(monster.rang) }}
                      >
                        {monster.rang}
                      </span>
                    </div>

                    {/* Element Badge */}
                    <span
                      className="generate-badge generate-element-badge"
                      style={{
                        backgroundColor: getElementColor(monster.element),
                      }}
                    >
                      {monster.element}
                    </span>

                    {/* Description */}
                    <p className="generate-monster-description">
                      {monster.description_carte || monster.description}
                    </p>

                    <hr className="generate-divider" />

                    {/* Stats */}
                    {monster.stats && (
                      <div className="generate-stats-grid">
                        <div className="generate-stat-box">
                          <span className="generate-stat-label">HP</span>
                          <span className="generate-stat-value">
                            {monster.stats.hp}
                          </span>
                        </div>
                        <div className="generate-stat-box">
                          <span className="generate-stat-label">ATK</span>
                          <span className="generate-stat-value">
                            {monster.stats.atk}
                          </span>
                        </div>
                        <div className="generate-stat-box">
                          <span className="generate-stat-label">DEF</span>
                          <span className="generate-stat-value">
                            {monster.stats.def}
                          </span>
                        </div>
                        <div className="generate-stat-box">
                          <span className="generate-stat-label">VIT</span>
                          <span className="generate-stat-value">
                            {monster.stats.vit}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {monster.skills && monster.skills.length > 0 && (
                      <div className="generate-skills">
                        <p className="generate-skills-title">
                          Compétences ({monster.skills.length})
                        </p>
                        {monster.skills.slice(0, 3).map((skill, skillIdx) => (
                          <div key={skillIdx} className="generate-skill-box">
                            <span className="generate-skill-name">
                              {skill.name}
                            </span>
                            <span className="generate-skill-description">
                              {skill.description}
                            </span>
                          </div>
                        ))}
                        {monster.skills.length > 3 && (
                          <span className="generate-skills-more">
                            +{monster.skills.length - 3} compétences
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="generate-results-footer">
              <button
                type="button"
                className="generate-action-btn primary"
                onClick={() => navigate('/admin/monsters')}
              >
                ➕ Ajouter à la Galerie
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateMonsters;
