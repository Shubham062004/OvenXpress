// Simple IndexedDB wrapper for offline caching
const DB_NAME = 'oven-express-cache';
const DB_VERSION = 1;
const STORES = ['menu', 'orders', 'user'] as const;

type StoreName = (typeof STORES)[number];

// Generic cacheable item type
export interface CacheItem {
  id: string;
  [key: string]: unknown;
}

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
};

// Save data to cache
export const saveToCache = async (
  storeName: StoreName,
  data: CacheItem | CacheItem[]
): Promise<void> => {
  try {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const addItem = (item: CacheItem): Promise<void> =>
        new Promise((res, rej) => {
          const req = store.put(item);
          req.onsuccess = () => res();
          req.onerror = () => rej(new Error('Failed to save item to cache'));
        });

      const operation = Array.isArray(data)
        ? Promise.all(data.map(addItem)).then(() => undefined)
        : addItem(data);

      operation
        .then(() => resolve())
        .catch((err) => reject(err));

      transaction.oncomplete = () => {
        db.close();
      };

      transaction.onerror = () => {
        reject(new Error('Transaction failed'));
      };
    });
  } catch (error) {
    console.error('Error saving to cache:', error);
    throw error;
  }
};

// Get data from cache
export const getFromCache = async <T = CacheItem>(
  storeName: StoreName,
  id?: string
): Promise<T | T[] | undefined> => {
  try {
    const db = await initDB();
    return await new Promise<T | T[] | undefined>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);

      if (id) {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(new Error('Failed to get data from cache'));
      } else {
        const results: T[] = [];
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (cursor) {
            results.push(cursor.value as T);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        request.onerror = () => reject(new Error('Failed to get data from cache'));
      }

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error getting from cache:', error);
    throw error;
  }
};

// Clear cache for a specific store
export const clearCache = async (storeName: StoreName): Promise<void> => {
  try {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear cache'));

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
};

// Check if we're online
export const isOnline = (): boolean => navigator.onLine;

const offlineCache = {
  saveToCache,
  getFromCache,
  clearCache,
  isOnline,
};

// ✅ Default export (so api.js can import offlineCache directly)
export default offlineCache;
