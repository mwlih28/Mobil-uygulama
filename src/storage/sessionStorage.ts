import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { TestSession } from '../types/models';

async function getAll(): Promise<TestSession[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
  return raw ? (JSON.parse(raw) as TestSession[]) : [];
}

async function getById(id: string): Promise<TestSession | null> {
  const all = await getAll();
  return all.find(s => s.id === id) ?? null;
}

async function save(session: TestSession): Promise<void> {
  const all = await getAll();
  const idx = all.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    all[idx] = session;
  } else {
    all.push(session);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(all));
}

async function remove(id: string): Promise<void> {
  const all = await getAll();
  const filtered = all.filter(s => s.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
}

export const sessionStorage = { getAll, getById, save, remove };
