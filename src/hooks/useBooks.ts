import { useState, useEffect, useCallback } from 'react';
import { bookStorage } from '../storage/bookStorage';
import type { Book } from '../types/models';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await bookStorage.getAll();
    setBooks(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addBook = useCallback(
    async (book: Book) => {
      await bookStorage.save(book);
      await load();
    },
    [load],
  );

  const removeBook = useCallback(
    async (id: string) => {
      await bookStorage.remove(id);
      await load();
    },
    [load],
  );

  return { books, loading, addBook, removeBook, reload: load };
}
