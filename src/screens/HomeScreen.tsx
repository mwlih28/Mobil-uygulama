import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import type { HomeScreenProps } from '../navigation/types';
import { useBooks } from '../hooks/useBooks';
import BookCard from '../components/BookCard';
import { answerKeyStorage } from '../storage/answerKeyStorage';
import { bookStorage } from '../storage/bookStorage';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { books, loading, removeBook, reload } = useBooks();
  const [testCounts, setTestCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', reload);
    return unsubscribe;
  }, [navigation, reload]);

  useEffect(() => {
    loadCounts();
  }, [books]);

  async function loadCounts() {
    const counts: Record<string, number> = {};
    for (const book of books) {
      const keys = await answerKeyStorage.getByBookId(book.id);
      counts[book.id] = keys.length;
    }
    setTestCounts(counts);
  }

  async function handleDeleteBook(id: string) {
    await answerKeyStorage.removeByBookId(id);
    await removeBook(id);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            testCount={testCounts[item.id] ?? 0}
            onPress={() =>
              navigation.navigate('BookDetail', {
                bookId: item.id,
                bookName: item.name,
              })
            }
            onDelete={() => handleDeleteBook(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} />
        }
        contentContainerStyle={
          books.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyTitle}>Henüz kitap yok</Text>
              <Text style={styles.emptySubtitle}>
                Aşağıdaki butona basarak ilk kitabını ekle
              </Text>
            </View>
          ) : null
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddBook')}>
        <Text style={styles.fabText}>+ Kitap Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: 8, paddingBottom: 100 },
  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    left: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
