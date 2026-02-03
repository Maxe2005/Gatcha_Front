import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { monstersApi } from '../services/api';

const MonsterContext = createContext(null);

export const MonsterProvider = ({ children }) => {
  const monstersCache = useRef(new Map());
  const [loadingMonsters, setLoadingMonsters] = useState(false);
  const [errorMonsters, setErrorMonsters] = useState(null);

  // Récupérer les monstres par IDs avec cache
  const fetchMonsters = useCallback(async (ids) => {
    if (!ids || ids.length === 0) {
      return [];
    }

    // Vérifier quels monstres sont déjà en cache
    const idsToFetch = ids.filter((id) => !monstersCache.current.has(String(id)));

    // Si tous les monstres sont en cache, les retourner directement
    if (idsToFetch.length === 0) {
      console.log('All monsters in cache, returning from cache');
      return ids.map((id) => monstersCache.current.get(String(id))).filter(Boolean);
    }

    setLoadingMonsters(true);
    setErrorMonsters(null);

    try {
      const idsString = idsToFetch.join(',');
      console.log('Fetching monsters with IDs:', idsString);
      const response = await monstersApi.get(`/api/monsters?ids=${idsString}`);
      console.log('Monsters fetched:', response.data);

      // Mettre en cache les nouveaux monstres
      response.data.forEach((monster, index) => {
        const monsterId = String(idsToFetch[index]);
        monstersCache.current.set(monsterId, monster);
      });

      // Retourner tous les monstres demandés (cache + nouvelles données)
      return ids.map((id) => monstersCache.current.get(String(id))).filter(Boolean);
    } catch (err) {
      console.error('Erreur lors de la récupération des monstres:', err);
      setErrorMonsters(err.message || 'Erreur lors de la récupération des monstres');
      return [];
    } finally {
      setLoadingMonsters(false);
    }
  }, []);

  // Récupérer un monstre spécifique
  const getMonster = useCallback((id) => {
    return monstersCache.current.get(String(id)) || null;
  }, []);

  // Vider le cache
  const clearCache = useCallback(() => {
    monstersCache.current = new Map();
  }, []);

  const value = {
    fetchMonsters,
    getMonster,
    clearCache,
    loadingMonsters,
    errorMonsters,
  };

  return (
    <MonsterContext.Provider value={value}>{children}</MonsterContext.Provider>
  );
};

export const useMonster = () => useContext(MonsterContext);
