import React, { useEffect } from 'react';
import {
  View,
  SectionList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import type { BookDetailScreenProps } from '../navigation/types';
import { useAnswerKeys } from '../hooks/useAnswerKeys';
import TestCard from '../components/TestCard';
import type { AnswerKey } from '../types/models';

interface Section { title: string; data: AnswerKey[] }

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
          <Text style={styles.headerBtnText}>+ Test</Text>
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
  topicMap.forEach((keys, topic) => sections.push({ title: topic, data: keys }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4361ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

      {answerKeys.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {answerKeys.length} test  ·  {[...topicMap.keys()].length} konu
          </Text>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TestCard
            answerKey={item}
            onStart={() => navigation.navigate('AnswerEntry', { answerKeyId: item.id, bookId })}
            onDelete={() => removeKey(item.id)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        contentContainerStyle={answerKeys.length === 0 ? styles.emptyWrap : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Text style={styles.emptyEmoji}>📋</Text></View>
            <Text style={styles.emptyTitle}>Test eklenmemiş</Text>
            <Text style={styles.emptySub}>
              Sağ üstteki "+ Test" butonuna basarak{'\n'}cevap anahtarı yükle
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('UploadAnswerKey', { bookId })}>
              <Text style={styles.emptyBtnText}>Cevap Anahtarı Yükle</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBtn: { marginRight: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  headerBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  summaryBar: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  summaryText: { fontSize: 13, color: '#9aa5b4', fontWeight: '500' },
  list: { paddingTop: 8, paddingBottom: 30 },
  emptyWrap: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
    gap: 8,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4361ee' },
  sectionTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: '#4a5568', textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4361ee',
    backgroundColor: '#eef1fb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 60 },
  emptyIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eef1fb', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0d1b2a', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#9aa5b4', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  emptyBtn: { backgroundColor: '#4361ee', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
