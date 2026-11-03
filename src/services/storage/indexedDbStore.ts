interface CacheRecord<T> { key: string; value: T; expiresAt: number }
const DB_NAME = 'leetcode-11-visualizer';
const STORE_NAME = 'cache';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function access<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = operation(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCached<T>(key: string): Promise<T | undefined> {
  const record = await access<CacheRecord<T> | undefined>('readonly', (store) => store.get(key));
  return record && record.expiresAt > Date.now() ? record.value : undefined;
}

export async function getCachedEvenExpired<T>(key: string): Promise<T | undefined> {
  return (await access<CacheRecord<T> | undefined>('readonly', (store) => store.get(key)))?.value;
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  await access<IDBValidKey>('readwrite', (store) => store.put({ key, value, expiresAt: Date.now() + ttlSeconds * 1000 }));
}
