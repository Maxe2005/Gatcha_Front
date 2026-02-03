import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { useAuth } from './AuthContext';
import { useMonster } from './MonsterContext';
import { joueurApi } from '../services/api';
/**
 * PlayerContext - Source unique de vérité pour les données du joueur
 *
 * Responsabilités :
 * - Charger les données complètes du joueur depuis l'API
 * - Gérer les monstres du joueur via MonsterContext
 * - Fournir une fonction de rafraîchissement
 *
 * Architecture :
 * - Récupère user + token depuis AuthContext
 * - Délègue la gestion du cache des monstres à MonsterContext
 * - Source unique : pas de duplication avec d'autres contexts
 *
 * Principes SOLID respectés :
 * - SRP : Une seule responsabilité (données du joueur)
 * - DRY : Pas de duplication
 * - Dependency Inversion : Dépend d'abstractions (contexts)
 */

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { fetchMonsters, loadingMonsters, errorMonsters } = useMonster();
  const [playerData, setPlayerData] = useState(null);
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les données complètes du joueur depuis l'API
  useEffect(() => {
    if (!user?.username || !token) {
      setPlayerData(null);
      setMonsters([]);
      return;
    }

    const loadPlayerData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('PlayerContext: Loading player data for', user.username);
        const response = await joueurApi.get(`/api/players/${user.username}`);
        console.log('PlayerContext: Player data loaded', response.data);
        setPlayerData(response.data);
      } catch (err) {
        console.error(
          'Erreur lors de la récupération des données du joueur:',
          err
        );
        setError(err.message || 'Erreur lors de la récupération des données');
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
        console.log('PlayerContext: No monsters to load');
        setMonsters([]);
        return;
      }

      try {
        console.log(
          'PlayerContext: Loading monsters with IDs',
          playerData.monsterIds
        );
        const playerMonsters = await fetchMonsters(playerData.monsterIds);
        console.log('PlayerContext: Monsters loaded', playerMonsters);
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
      const response = await joueurApi.get(
        `/api/players/${playerData.username}`
      );
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
    error,
    loadingMonsters,
    errorMonsters,
    refreshPlayerData,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
