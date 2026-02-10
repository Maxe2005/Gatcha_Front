import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
} from 'react';
import type { PropsWithChildren } from 'react';
import { monstersService } from '../services/monstersService';
import { logger } from '../services/logger';
import type { MonsterData } from '../types/monster';

type MonsterContextValue = {
  fetchMonsters: (ids: Array<string | number>) => Promise<MonsterData[]>;
  getMonster: (id: string | number) => MonsterData | null;
  clearCache: () => void;
  loadingMonsters: boolean;
  errorMonsters: string | null;
};
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

const MonsterContext = createContext<MonsterContextValue | null>(null);

export const MonsterProvider = ({ children }: PropsWithChildren) => {
  const monstersCache = useRef<Map<string, MonsterData>>(new Map());
  const [loadingMonsters, setLoadingMonsters] = useState(false);
  const [errorMonsters, setErrorMonsters] = useState<string | null>(null);

  // Récupérer les monstres par IDs avec cache
  const fetchMonsters = useCallback(
    async (ids: Array<string | number>): Promise<MonsterData[]> => {
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
          .filter(Boolean) as MonsterData[];
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
          .filter(Boolean) as MonsterData[];
      } catch (err) {
        logger.error('MonsterContext', 'Error fetching monsters:', err);
        setErrorMonsters(
          (err as Error).message ||
            'Erreur lors de la récupération des monstres'
        );
        return [];
      } finally {
        setLoadingMonsters(false);
      }
    },
    []
  );

  // Récupérer un monstre spécifique
  const getMonster = useCallback((id: string | number): MonsterData | null => {
    return monstersCache.current.get(String(id)) || null;
  }, []);

  // Vider le cache
  const clearCache = useCallback((): void => {
    monstersCache.current = new Map();
  }, []);

  const value: MonsterContextValue = {
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

export const useMonster = (): MonsterContextValue | null =>
  useContext(MonsterContext);
