import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { Book } from '../types/models';

async function getAll(): Promise<Book[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
  return raw ? (JSON.parse(raw) as Book[]) : [];
}

async function save(book: Book): Promise<void> {
  const all = await getAll();
  const idx = all.findIndex(b => b.id === book.id);
  if (idx >= 0) {
    all[idx] = book;
  } else {
    all.push(book);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(all));
}

async function remove(id: string): Promise<void> {
  const all = await getAll();
  const filtered = all.filter(b => b.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(filtered));
}

export const bookStorage = { getAll, save, remove };
