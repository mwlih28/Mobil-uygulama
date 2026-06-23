import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { AnswerKey } from '../types/models';

async function getAll(): Promise<AnswerKey[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.ANSWER_KEYS);
  return raw ? (JSON.parse(raw) as AnswerKey[]) : [];
}

async function getByBookId(bookId: string): Promise<AnswerKey[]> {
  const all = await getAll();
  return all.filter(ak => ak.bookId === bookId);
}

async function save(answerKey: AnswerKey): Promise<void> {
  const all = await getAll();
  const idx = all.findIndex(ak => ak.id === answerKey.id);
  if (idx >= 0) {
    all[idx] = answerKey;
  } else {
    all.push(answerKey);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.ANSWER_KEYS, JSON.stringify(all));
}

async function getById(id: string): Promise<AnswerKey | null> {
  const all = await getAll();
  return all.find(ak => ak.id === id) ?? null;
}

async function remove(id: string): Promise<void> {
  const all = await getAll();
  const filtered = all.filter(ak => ak.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.ANSWER_KEYS, JSON.stringify(filtered));
}

async function removeByBookId(bookId: string): Promise<void> {
  const all = await getAll();
  const filtered = all.filter(ak => ak.bookId !== bookId);
  await AsyncStorage.setItem(STORAGE_KEYS.ANSWER_KEYS, JSON.stringify(filtered));
}

export const answerKeyStorage = {
  getAll,
  getByBookId,
  getById,
  save,
  remove,
  removeByBookId,
};
