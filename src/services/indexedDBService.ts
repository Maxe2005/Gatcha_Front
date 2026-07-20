/**
 * IndexedDB Service
 * Persiste les données: monstres, joueur, ressources
 * Synchronise avec les services API
 */
import type { MonsterData } from '../types/monster';

const DB_NAME = 'GatchaDB';
const DB_VERSION = 1;

// Stores disponibles
const STORES = {
  MONSTERS: 'monsters',
  PLAYER: 'player',
  RESOURCES: 'resources',
  INVOCATION_HISTORY: 'invocationHistory',
  CACHE_META: 'cacheMeta', // Timestamps pour validité du cache
};

let db: IDBDatabase | null = null;

/**
 * Initialise la base IndexedDB
 */
const initDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      // Créer les object stores s'ils n'existent pas
      if (!database.objectStoreNames.contains(STORES.MONSTERS)) {
        const monstersStore = database.createObjectStore(STORES.MONSTERS, {
          keyPath: 'id',
        });
        monstersStore.createIndex('rank', 'rang');
        monstersStore.createIndex('element', 'element');
      }

      if (!database.objectStoreNames.contains(STORES.PLAYER)) {
        database.createObjectStore(STORES.PLAYER, { keyPath: 'username' });
      }

      if (!database.objectStoreNames.contains(STORES.RESOURCES)) {
        database.createObjectStore(STORES.RESOURCES, { keyPath: 'username' });
      }

      if (!database.objectStoreNames.contains(STORES.INVOCATION_HISTORY)) {
        const historyStore = database.createObjectStore(
          STORES.INVOCATION_HISTORY,
          { keyPath: 'id', autoIncrement: true }
        );
        historyStore.createIndex('username', 'username');
        historyStore.createIndex('date', 'invokedAt');
      }

      if (!database.objectStoreNames.contains(STORES.CACHE_META)) {
        database.createObjectStore(STORES.CACHE_META, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Assure que la DB est initialisée et la retourne
 */
const ensureDB = async (): Promise<IDBDatabase> => {
  if (!db) {
    db = await initDB();
  }
  return db;
};

/**
 * Sauvegarde un monstre dans le cache
 */
export const cacheMonster = async (monster: MonsterData) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MONSTERS], 'readwrite');
    const store = transaction.objectStore(STORES.MONSTERS);
    const request = store.put(monster);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(monster);
  });
};

/**
 * Sauvegarde plusieurs monstres
 */
export const cacheMonsters = async (monsters: MonsterData[]) => {
  await ensureDB();
  return Promise.all(monsters.map((monster) => cacheMonster(monster)));
};

/**
 * Récupère un monstre du cache
 */
export const getMonsterFromCache = async (id: string | number) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MONSTERS], 'readonly');
    const store = transaction.objectStore(STORES.MONSTERS);
    const request = store.get(String(id));

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Récupère tous les monstres du cache
 */
export const getAllMonstersFromCache = async () => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MONSTERS], 'readonly');
    const store = transaction.objectStore(STORES.MONSTERS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Récupère les monstres filtrés par rang
 */
export const getMonstersByRankFromCache = async (rank: string) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MONSTERS], 'readonly');
    const store = transaction.objectStore(STORES.MONSTERS);
    const index = store.index('rank');
    const request = index.getAll(rank);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Sauvegarde les données du joueur
 */
export const cachePlayerData = async (
  username: string,
  playerData: Record<string, unknown>
) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PLAYER], 'readwrite');
    const store = transaction.objectStore(STORES.PLAYER);
    const request = store.put({ ...playerData, username });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(playerData);
  });
};

/**
 * Récupère les données du joueur
 */
export const getPlayerDataFromCache = async (username: string) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PLAYER], 'readonly');
    const store = transaction.objectStore(STORES.PLAYER);
    const request = store.get(username);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Sauvegarde les ressources du joueur
 */
export const cacheResources = async (
  username: string,
  resources: Record<string, unknown>
) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.RESOURCES], 'readwrite');
    const store = transaction.objectStore(STORES.RESOURCES);
    const request = store.put({ ...resources, username });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(resources);
  });
};

/**
 * Récupère les ressources du joueur
 */
export const getResourcesFromCache = async (username: string) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.RESOURCES], 'readonly');
    const store = transaction.objectStore(STORES.RESOURCES);
    const request = store.get(username);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Ajoute un enregistrement à l'historique d'invocations
 */
export const addInvocationHistory = async (
  username: string,
  monster: MonsterData
) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.INVOCATION_HISTORY],
      'readwrite'
    );
    const store = transaction.objectStore(STORES.INVOCATION_HISTORY);
    const request = store.add({
      username,
      monster,
      invokedAt: new Date().toISOString(),
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Récupère l'historique d'invocations d'un joueur
 */
export const getInvocationHistory = async (username: string, limit = 50) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.INVOCATION_HISTORY], 'readonly');
    const store = transaction.objectStore(STORES.INVOCATION_HISTORY);
    const index = store.index('username');
    const request = index.getAll(username);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result;
      // Retourner les derniers 'limit' enregistrements en ordre inverse
      resolve(results.reverse().slice(0, limit));
    };
  });
};

/**
 * Valide si le cache est encore frais (< 1 heure)
 */
export const isCacheFresh = async (key: string, maxAgeMs = 3600000) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHE_META], 'readonly');
    const store = transaction.objectStore(STORES.CACHE_META);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const meta = request.result;
      if (!meta) return resolve(false);

      const timeDiff = Date.now() - meta.timestamp;
      resolve(timeDiff < maxAgeMs);
    };
  });
};

/**
 * Marque une clé comme fraîchement mises en cache
 */
export const markCacheFresh = async (key: string) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHE_META], 'readwrite');
    const store = transaction.objectStore(STORES.CACHE_META);
    const request = store.put({ key, timestamp: Date.now() });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
};

/**
 * Efface le cache entier
 */
export const clearAllCache = async () => {
  const db = await ensureDB();
  const storeNames = Object.values(STORES);
  return Promise.all(
    storeNames.map(
      (storeName) =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.clear();

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(true);
        })
    )
  );
};

/**
 * Efface le cache des monstres uniquement
 */
export const clearMonstersCache = async () => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MONSTERS], 'readwrite');
    const store = transaction.objectStore(STORES.MONSTERS);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
};

export default {
  cacheMonster,
  cacheMonsters,
  getMonsterFromCache,
  getAllMonstersFromCache,
  getMonstersByRankFromCache,
  cachePlayerData,
  getPlayerDataFromCache,
  cacheResources,
  getResourcesFromCache,
  addInvocationHistory,
  getInvocationHistory,
  isCacheFresh,
  markCacheFresh,
  clearAllCache,
  clearMonstersCache,
};
