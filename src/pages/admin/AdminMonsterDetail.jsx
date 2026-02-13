import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApiService } from '../../services/adminService';
import ThemeToggle from '../../components/ThemeToggle';
import '../admin/AdminMonsterDetail.css';
import MonsterSummaryTab from './MonsterSummaryTab';
import MonsterDataTab from './MonsterDataTab';
import MonsterValidationTab from './MonsterValidationTab';
import MonsterHistoryTab from './MonsterHistoryTab';
import MonsterPreviewTab from './MonsterPreviewTab';
import MonsterImagesTab from './MonsterImagesTab';

const AdminMonsterDetail = () => {
  const { monsterId } = useParams();
  const navigate = useNavigate();
  const [monster, setMonster] = useState(null);
  const [monsterImages, setMonsterImages] = useState([]);
  const [defaultImage, setDefaultImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [setDefaultError, setSetDefaultError] = useState(null);

  // Définir une image comme image par défaut
  const handleSetDefaultImage = async (imageId) => {
    setIsSettingDefault(true);
    setSetDefaultError(null);
    try {
      await adminApiService.setMonsterDefaultImage(monsterId, imageId);
      // Refresh images
      const imagesRes = await adminApiService.getMonsterImages(monsterId);
      setMonsterImages(imagesRes.images || []);
      setDefaultImage(imagesRes.default_image || null);
    } catch (err) {
      setSetDefaultError(
        err.response?.data?.detail ||
          "Erreur lors du changement d'image par défaut"
      );
    } finally {
      setIsSettingDefault(false);
    }
  };
  const [newImagePrompt, setNewImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  // Génération d'une nouvelle image
  const handleGenerateImage = async (e) => {
    e.preventDefault();
    setIsGeneratingImage(true);
    setGenerateError(null);
    try {
      await adminApiService.generateMonsterImage({
        monster_id: monster?.metadata?.monster_id,
        image_name:
          monster?.monster_data?.name || monster?.monster_data?.nom || 'image',
        custom_prompt: newImagePrompt,
      });
      // Refresh images
      const imagesRes = await adminApiService.getMonsterImages(monsterId);
      setMonsterImages(imagesRes.images || []);
      setDefaultImage(imagesRes.default_image || null);
      setNewImagePrompt('');
    } catch (err) {
      setGenerateError(
        err.response?.data?.detail || "Erreur lors de la génération de l'image"
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Form states for actions
  const [reviewNotes, setReviewNotes] = useState('');
  const [correctedData, setCorrectedData] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showCorrectForm, setShowCorrectForm] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve');
  const [imagesError, setImagesError] = useState(null);

  useEffect(() => {
    const fetchMonsterDetail = async () => {
      try {
        setLoading(true);
        const [detail, history] = await Promise.all([
          adminApiService.getMonsterDetail(monsterId),
          adminApiService.getMonsterHistory(monsterId),
        ]);
        setMonster(detail);
        setHistory(history.history || []);
        setCorrectedData(JSON.stringify(detail?.monster_data || {}, null, 2));
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.detail || 'Erreur lors du chargement du monstre'
        );
        console.error('Error fetching monster:', err);
      } finally {
        setLoading(false);
      }
      // Charger les images séparément
      try {
        setImagesError(null);
        const imagesRes = await adminApiService.getMonsterImages(monsterId);
        setMonsterImages(imagesRes.images || []);
        setDefaultImage(imagesRes.default_image || null);
      } catch (err) {
        setMonsterImages([]);
        setDefaultImage(null);
        setImagesError(
          err.response?.data?.detail ||
            'Erreur lors du chargement des images du monstre'
        );
      }
    };

    fetchMonsterDetail();
  }, [monsterId]);

  const handleReview = async () => {
    try {
      setIsActionLoading(true);
      setActionError(null);
      await adminApiService.reviewMonster(
        monsterId,
        reviewAction,
        reviewNotes || null
      );
      // Refresh monster data
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      setMonster(detail);
      setHistory(history.history || []);
      setShowReviewForm(false);
      setReviewNotes('');
      alert(`Monstre ${reviewAction} avec succès`);
    } catch (err) {
      setActionError(
        err.response?.data?.detail || 'Erreur lors de la révision du monstre'
      );
      console.error('Error reviewing monster:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCorrect = async () => {
    try {
      setIsActionLoading(true);
      setActionError(null);
      let parsedData;
      try {
        parsedData = JSON.parse(correctedData);
      } catch (e) {
        setActionError('Données JSON invalides');
        setIsActionLoading(false);
        return;
      }
      await adminApiService.correctMonster(
        monsterId,
        parsedData,
        reviewNotes || null
      );
      // Refresh monster data
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      setMonster(detail);
      setHistory(history.history || []);
      setShowCorrectForm(false);
      setReviewNotes('');
      alert('Monstre corrigé avec succès');
    } catch (err) {
      setActionError(
        err.response?.data?.detail || 'Erreur lors de la correction'
      );
      console.error('Error correcting monster:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-monster-detail">
        <div className="loading">Chargement du monstre...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-monster-detail">
        <button
          onClick={() => navigate('/admin/monsters')}
          className="btn-back"
        >
          ← Retour
        </button>
        <div className="error">{error}</div>
      </div>
    );
  }

  const canApproveReject = monster?.metadata?.state === 'PENDING_REVIEW';
  const canCorrect = monster?.metadata?.state === 'DEFECTIVE';
  const canPreviewCard = ['PENDING_REVIEW', 'APPROVED', 'TRANSMITTED'].includes(
    monster?.metadata?.state
  );

  return (
    <div className="admin-monster-detail">
      <div className="detail-header">
        <button
          onClick={() => navigate('/admin/monsters')}
          className="btn-back"
        >
          ← Retour
        </button>
        <div className="header-title">
          {monster?.monster_data && (
            <h1 className="monster-name-subtitle">
              {monster.monster_data.name ||
                monster.monster_data.title ||
                monster.monster_data.nom ||
                (typeof monster.monster_data === 'object'
                  ? Object.values(monster.monster_data)[0]
                  : monster.monster_data)}
            </h1>
          )}
        </div>
        <span
          className={`state-badge state-${monster?.metadata?.state.toLowerCase()}`}
        >
          {monster?.metadata?.state}
        </span>
        <ThemeToggle />
      </div>

      {actionError && <div className="error-message">{actionError}</div>}

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Résumé
        </button>
        <button
          className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Données
        </button>
        <button
          className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Images
        </button>
        <button
          className={`tab-button ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Validation
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historique
        </button>
        {canPreviewCard && (
          <button
            className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview Carte
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && (
          <MonsterSummaryTab
            monster={monster}
            canApproveReject={canApproveReject}
            canCorrect={canCorrect}
            setShowReviewForm={setShowReviewForm}
            setShowCorrectForm={setShowCorrectForm}
          />
        )}
        {activeTab === 'data' && <MonsterDataTab monster={monster} />}
        {activeTab === 'images' && (
          <MonsterImagesTab
            defaultImage={defaultImage}
            monsterImages={monsterImages}
            isSettingDefault={isSettingDefault}
            setDefaultError={setSetDefaultError}
            handleSetDefaultImage={handleSetDefaultImage}
            newImagePrompt={newImagePrompt}
            setNewImagePrompt={setNewImagePrompt}
            handleGenerateImage={handleGenerateImage}
            isGeneratingImage={isGeneratingImage}
            generateError={generateError}
          />
        )}
        {activeTab === 'validation' && (
          <MonsterValidationTab monster={monster} />
        )}
        {activeTab === 'history' && <MonsterHistoryTab history={history} />}
        {activeTab === 'preview' && canPreviewCard && (
          <MonsterPreviewTab monster={monster} />
        )}
      </div>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Review du Monstre</h2>
            <div className="form-group">
              <label>Action</label>
              <select
                value={reviewAction}
                onChange={(e) => setReviewAction(e.target.value)}
              >
                <option value="approve">Approuver</option>
                <option value="reject">Rejeter</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes (optionnel)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Entrez vos notes..."
                rows={5}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={() => setShowReviewForm(false)}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleReview}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Correct Modal */}
      {showCorrectForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowCorrectForm(false)}
        >
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <h2>Corriger le Monstre</h2>
            <div className="form-group">
              <label>Données Corrigées (JSON)</label>
              <textarea
                value={correctedData}
                onChange={(e) => setCorrectedData(e.target.value)}
                rows={15}
                className="json-editor"
              />
            </div>
            <div className="form-group">
              <label>Notes (optionnel)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Entrez vos notes de correction..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={() => setShowCorrectForm(false)}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleCorrect}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'En cours...' : 'Corriger'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMonsterDetail;
