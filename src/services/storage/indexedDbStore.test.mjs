import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCached, getCachedEvenExpired, setCached } from './indexedDbStore.ts';

function createStore() {
  const records = new Map();
  const store = {
    get: vi.fn((key) => request(records.get(key))),
    put: vi.fn((record) => { records.set(record.key, record); return request(record.key); }),
  };
  return store;
}

function request(result) {
  const value = { result, onsuccess: null, onerror: null };
  queueMicrotask(() => value.onsuccess?.());
  return value;
}

let store;
beforeEach(() => {
  store = createStore();
  vi.stubGlobal('indexedDB', {
    open: () => {
      const dbRequest = { result: { createObjectStore: vi.fn(), transaction: () => ({ objectStore: () => store }) }, onsuccess: null, onupgradeneeded: null, onerror: null };
      queueMicrotask(() => { dbRequest.onupgradeneeded?.(); dbRequest.onsuccess?.(); });
      return dbRequest;
    },
  });
});

describe('IndexedDB TTL cache', () => {
  it('writes records and reads fresh entries', async () => {
    await setCached('k', 42, 60);
    expect(await getCached('k')).toBe(42);
  });

  it('hides expired values from normal reads but keeps stale fallback', async () => {
    await setCached('old', 7, -1);
    expect(await getCached('old')).toBeUndefined();
    expect(await getCachedEvenExpired('old')).toBe(7);
  });

  it('returns undefined for missing keys', async () => {
    expect(await getCachedEvenExpired('missing')).toBeUndefined();
  });
});
