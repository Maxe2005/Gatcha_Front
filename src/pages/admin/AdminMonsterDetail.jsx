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
  const [actionError, setActionError] = useState(null);
  // Les états pour la gestion des images sont déplacés dans MonsterImagesTab

  const canApproveReject = monster?.metadata?.state === 'PENDING_REVIEW';
  const canCorrect = monster?.metadata?.state === 'DEFECTIVE';
  const isInAdvancedState = [
    'PENDING_REVIEW',
    'APPROVED',
    'TRANSMITTED',
  ].includes(monster?.metadata?.state);

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
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.detail || 'Erreur lors du chargement du monstre'
        );
        console.error('Error fetching monster:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonsterDetail();
  }, [monsterId]);

  // Charger les images uniquement si l'onglet images est visible (isInAdvancedState)
  useEffect(() => {
    const fetchImages = async () => {
      if (!isInAdvancedState) {
        setMonsterImages([]);
        setDefaultImage(null);
        return;
      }
      try {
        const imagesRes = await adminApiService.getMonsterImages(monsterId);
        setMonsterImages(imagesRes.images || []);
        setDefaultImage(imagesRes.default_image || null);
      } catch (err) {
        setMonsterImages([]);
        setDefaultImage(null);
      }
    };
    fetchImages();
  }, [monsterId, isInAdvancedState]);

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
        {isInAdvancedState && (
          <button
            className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            Images
          </button>
        )}
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
        {isInAdvancedState && (
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
            monsterId={monsterId}
            onMonsterUpdate={(detail, historyArr) => {
              setMonster(detail);
              setHistory(historyArr);
            }}
            onActionError={setActionError}
          />
        )}
        {activeTab === 'data' && (
          <MonsterDataTab
            monster={monster}
            monsterId={monsterId}
            onMonsterUpdate={(detail, historyArr) => {
              setMonster(detail);
              setHistory(historyArr);
            }}
            onActionError={setActionError}
          />
        )}
        {activeTab === 'images' && (
          <MonsterImagesTab
            monsterId={monsterId}
            monster={monster}
            defaultImage={defaultImage}
            monsterImages={monsterImages}
            onImagesUpdate={(imagesRes) => {
              setMonsterImages(imagesRes.images || []);
              setDefaultImage(imagesRes.default_image || null);
            }}
          />
        )}
        {activeTab === 'validation' && (
          <MonsterValidationTab monster={monster} />
        )}
        {activeTab === 'history' && <MonsterHistoryTab history={history} />}
        {activeTab === 'preview' && isInAdvancedState && (
          <MonsterPreviewTab monster={monster} />
        )}
      </div>

      {/* Les modaux sont désormais gérés dans MonsterSummaryTab */}
    </div>
  );
};

export default AdminMonsterDetail;
