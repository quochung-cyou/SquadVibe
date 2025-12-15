
import { Member, Garment, Place } from '../types';

const DB_NAME = 'SquadVibeDB';
const DB_VERSION = 2; // Incremented version for schema update

export interface SearchRecord {
  id: string;
  query: string;
  timestamp: number;
  results: Place[];
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('squad')) {
        db.createObjectStore('squad', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('closet')) {
        db.createObjectStore('closet', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('searchHistory')) {
        db.createObjectStore('searchHistory', { keyPath: 'id' });
      }
    };
  });
};

export const saveItem = async (storeName: 'squad' | 'closet' | 'searchHistory', item: any): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteItem = async (storeName: 'squad' | 'closet' | 'searchHistory', id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllItems = async <T>(storeName: 'squad' | 'closet' | 'searchHistory'): Promise<T[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
};
