import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useMonster } from './MonsterContext';
import { joueurApi } from '../services/api';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const { playerData: authPlayerData, user, token } = useAuth();
  const { fetchMonsters, loadingMonsters, errorMonsters } = useMonster();
  const [playerData, setPlayerData] = useState(null);
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les données complètes du joueur depuis l'API
  useEffect(() => {
    if (!user?.username || !token) {
      setPlayerData(null);
      return;
    }

    const loadPlayerData = async () => {
      setLoading(true);
      try {
        const response = await joueurApi.get(`/api/players/${user.username}`);
        setPlayerData(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des données du joueur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [user?.username, token]);

  // Récupérer les monstres du joueur via le MonsterContext
  useEffect(() => {
    const loadPlayerMonsters = async () => {
      if (!playerData?.monsterIds || playerData.monsterIds.length === 0) {
        setMonsters([]);
        return;
      }

      try {
        const playerMonsters = await fetchMonsters(playerData.monsterIds);
        setMonsters(playerMonsters);
      } catch (err) {
        console.error('Erreur lors du chargement des monstres du joueur:', err);
        setMonsters([]);
      }
    };

    loadPlayerMonsters();
  }, [playerData?.monsterIds, fetchMonsters]);

  // Fonction pour rafraîchir les données du joueur manuellement
  const refreshPlayerData = useCallback(async () => {
    if (!token || !playerData?.username) {
      return null;
    }

    setLoading(true);
    try {
      const response = await joueurApi.get(`/api/players/${playerData.username}`);
      setPlayerData(response.data);
      return response.data;
    } catch (err) {
      console.error(
        'Erreur lors de la récupération des données du joueur:',
        err
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, playerData?.username]);

  const value = {
    playerData,
    monsters,
    loading,
    loadingMonsters,
    errorMonsters,
    refreshPlayerData,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
