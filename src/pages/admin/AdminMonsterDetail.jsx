import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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

  // Lire l'onglet actif depuis la query `tab` (si présente)
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const allowed = [
      'summary',
      'data',
      'images',
      'validation',
      'history',
      'preview',
    ];
    if (tabFromUrl && allowed.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

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

  // Mettre à jour l'URL quand l'onglet change et gérer le fallback
  const handleTabChange = (tab) => {
    // if (tab === 'images' && !isInAdvancedState) {
    //   tab = 'summary';
    // }
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  // // Si on arrive sur `images` via URL mais que l'état n'autorise pas, fallback
  // useEffect(() => {
  //   if (activeTab === 'images' && !isInAdvancedState) {
  //     const newParams = new URLSearchParams(searchParams);
  //     newParams.set('tab', 'summary');
  //     setSearchParams(newParams);
  //     setActiveTab('summary');
  //   }
  // }, [isInAdvancedState, activeTab, searchParams, setSearchParams]);

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
          onClick={() => handleTabChange('summary')}
        >
          Résumé
        </button>
        <button
          className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => handleTabChange('data')}
        >
          Données
        </button>
        {isInAdvancedState && (
          <button
            className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => handleTabChange('images')}
          >
            Images
          </button>
        )}
        <button
          className={`tab-button ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => handleTabChange('validation')}
        >
          Validation
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          Historique
        </button>
        {isInAdvancedState && (
          <button
            className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => handleTabChange('preview')}
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
