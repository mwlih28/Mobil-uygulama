import { useState, useEffect, useCallback } from 'react';
import { answerKeyStorage } from '../storage/answerKeyStorage';
import type { AnswerKey } from '../types/models';

export function useAnswerKeys(bookId: string) {
  const [answerKeys, setAnswerKeys] = useState<AnswerKey[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await answerKeyStorage.getByBookId(bookId);
    setAnswerKeys(data.sort((a, b) => a.topic.localeCompare(b.topic, 'tr') || a.testNumber - b.testNumber));
    setLoading(false);
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  const removeKey = useCallback(
    async (id: string) => {
      await answerKeyStorage.remove(id);
      await load();
    },
    [load],
  );

  return { answerKeys, loading, removeKey, reload: load };
}
