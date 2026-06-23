import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import type { HomeScreenProps } from '../navigation/types';
import { useBooks } from '../hooks/useBooks';
import BookCard from '../components/BookCard';
import { answerKeyStorage } from '../storage/answerKeyStorage';

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

  const totalTests = Object.values(testCounts).reduce((s, n) => s + n, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Test Analiz</Text>
          <Text style={styles.headerSub}>Çalışmalarını takip et</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statNum}>{books.length}</Text>
            <Text style={styles.statLbl}>Kitap</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBadge}>
            <Text style={styles.statNum}>{totalTests}</Text>
            <Text style={styles.statLbl}>Test</Text>
          </View>
        </View>
      </View>

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
          <RefreshControl refreshing={loading} onRefresh={reload} tintColor="#4361ee" />
        }
        contentContainerStyle={books.length === 0 ? styles.emptyWrap : styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyEmoji}>📚</Text>
              </View>
              <Text style={styles.emptyTitle}>Henüz kitap yok</Text>
              <Text style={styles.emptySub}>
                İlk kitabını ekleyerek cevap anahtarlarını yüklemeye başla
              </Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddBook')}
        activeOpacity={0.85}>
        <Text style={styles.fabIcon}>＋</Text>
        <Text style={styles.fabText}>Kitap Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    backgroundColor: '#0d1b2a',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 10,
  },
  statBadge: { alignItems: 'center', minWidth: 36 },
  statNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
  list: { paddingTop: 12, paddingBottom: 120 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef1fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#0d1b2a', marginBottom: 10 },
  emptySub: { fontSize: 14, color: '#9aa5b4', textAlign: 'center', lineHeight: 22 },
  fab: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    backgroundColor: '#4361ee',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 8,
    elevation: 8,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  fabIcon: { fontSize: 22, color: '#fff', fontWeight: '300', lineHeight: 24 },
  fabText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
});
