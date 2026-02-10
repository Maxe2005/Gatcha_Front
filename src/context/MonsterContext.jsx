import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
} from 'react';
import { monstersService } from '../services/monstersService';
import { logger } from '../services/logger';

/** @typedef {import('../types/monster').MonsterData} MonsterData */
/**
 * @typedef {object} MonsterContextValue
 * @property {(ids: Array<string | number>) => Promise<Array<MonsterData>>} fetchMonsters
 * @property {(id: string | number) => MonsterData | null} getMonster
 * @property {() => void} clearCache
 * @property {boolean} loadingMonsters
 * @property {string | null} errorMonsters
 */
/**
 * MonsterContext - Cache global et gestion des monstres
 *
 * Responsabilités :
 * - Fournir un cache global pour tous les monstres
 * - Éviter les appels API redondants
 * - Être réutilisable par plusieurs composants (Inventory, Gacha, etc.)
 *
 * Architecture :
 * - Cache avec useRef (pas de re-render inutiles)
 * - Fonction fetchMonsters : charge uniquement les monstres manquants
 * - Indépendant des autres contexts (réutilisable)
 *
 * Principes SOLID respectés :
 * - SRP : Gère uniquement le cache des monstres
 * - OCP : Extensible sans modification
 */

/** @type {React.Context<MonsterContextValue | null>} */
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
    const idsToFetch = ids.filter(
      (id) => !monstersCache.current.has(String(id))
    );

    // Si tous les monstres sont en cache, les retourner directement
    if (idsToFetch.length === 0) {
      logger.debug('MonsterContext', 'All monsters in cache');
      return ids
        .map((id) => monstersCache.current.get(String(id)))
        .filter(Boolean);
    }

    setLoadingMonsters(true);
    setErrorMonsters(null);

    try {
      logger.debug('MonsterContext', 'Fetching monsters with IDs', {
        ids: idsToFetch,
      });
      const monstersList = await monstersService.getMonsters(idsToFetch);
      logger.debug('MonsterContext', 'Monsters fetched successfully', {
        count: monstersList.length,
      });

      // Mettre en cache les nouveaux monstres
      monstersList.forEach((monster) => {
        const monsterId = String(monster.id);
        monstersCache.current.set(monsterId, monster);
      });

      // Retourner tous les monstres demandés (cache + nouvelles données)
      return ids
        .map((id) => monstersCache.current.get(String(id)))
        .filter(Boolean);
    } catch (err) {
      logger.error('MonsterContext', 'Error fetching monsters:', err);
      setErrorMonsters(
        err.message || 'Erreur lors de la récupération des monstres'
      );
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

  /** @type {MonsterContextValue} */
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

/** @returns {MonsterContextValue | null} */
export const useMonster = () => useContext(MonsterContext);
