import React, { useEffect } from 'react';
import {
  View,
  SectionList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { BookDetailScreenProps } from '../navigation/types';
import { useAnswerKeys } from '../hooks/useAnswerKeys';
import TestCard from '../components/TestCard';
import type { AnswerKey } from '../types/models';

interface Section {
  title: string;
  data: AnswerKey[];
}

export default function BookDetailScreen({ navigation, route }: BookDetailScreenProps) {
  const { bookId } = route.params;
  const { answerKeys, loading, removeKey, reload } = useAnswerKeys(bookId);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', reload);
    return unsubscribe;
  }, [navigation, reload]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('UploadAnswerKey', { bookId })}
          style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>+ Test Ekle</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, bookId]);

  const sections: Section[] = [];
  const topicMap = new Map<string, AnswerKey[]>();
  answerKeys.forEach(ak => {
    if (!topicMap.has(ak.topic)) topicMap.set(ak.topic, []);
    topicMap.get(ak.topic)!.push(ak);
  });
  topicMap.forEach((keys, topic) => {
    sections.push({ title: topic, data: keys });
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TestCard
            answerKey={item}
            onStart={() =>
              navigation.navigate('AnswerEntry', {
                answerKeyId: item.id,
                bookId,
              })
            }
            onDelete={() => removeKey(item.id)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={
          answerKeys.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Test bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
              Sağ üstten cevap anahtarı yükleyerek test ekleyin
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: 8, paddingBottom: 24 },
  emptyContainer: { flex: 1 },
  empty: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
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
  sectionHeader: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerBtn: {
    marginRight: 4,
  },
  headerBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
