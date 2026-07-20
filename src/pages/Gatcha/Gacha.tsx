// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePlayer } from '../../context/PlayerContext';
import { invocationService } from '../../services/invocationService';
import { notifySuccess, notifyError } from '../../services/notificationService';
import GatchaCard from '../../components/GatchaCard/GatchaCard';
import { useNavigate } from 'react-router-dom';
import './Gacha.css';
import type { MonsterData } from '../../types/monster';

const Gacha = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { refreshPlayerData } = usePlayer();
  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleInvoke = async () => {
    setLoading(true);
    setMonster(null);
    try {
      // Le service normalise déjà la réponse (name/rank/element/stats)
      const invokedMonster = await invocationService.invoke(user.username);
      setMonster(invokedMonster);
      notifySuccess('✨ Invocation réussie!');
      // Recharge le joueur pour que le nouveau monstre apparaisse
      // dans l'inventaire sans rechargement de page
      refreshPlayerData();
    } catch (err) {
      notifyError(err);
      setMonster(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`gacha-page ${theme === 'dark' ? 'theme-dark' : 'theme-divine'} ${isRevealed ? 'revealed' : 'entering'}`}
    >
      <div className="gacha-back-bar">
        <button
          onClick={() => navigate('/home')}
          className="gacha-back-btn"
        >
          ← Retour Home
        </button>
      </div>

      <div className="gacha-container">
        <h1 className="gacha-title">Chambre d&apos;Invocation</h1>

        <button
          onClick={handleInvoke}
          disabled={loading}
          className={`gacha-invoke-btn ${theme}`}
        >
          {loading ? (
            <span className="gacha-invoke-spinner" aria-hidden="true" />
          ) : (
            'INVOQUER'
          )}
        </button>

        {monster && (
          <div className="gacha-result">
            <GatchaCard monstre={monster} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Gacha;
