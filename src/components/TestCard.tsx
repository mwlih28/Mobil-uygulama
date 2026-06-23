import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { AnswerKey } from '../types/models';

interface Props {
  answerKey: AnswerKey;
  onStart: () => void;
  onDelete: () => void;
}

export default function TestCard({ answerKey, onStart, onDelete }: Props) {
  const handleDelete = () => {
    Alert.alert(
      'Testi Sil',
      `"${answerKey.testName}" silinecek.`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.numBadge}>
          <Text style={styles.numText}>{answerKey.testNumber}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{answerKey.testName}</Text>
        <Text style={styles.meta}>{answerKey.totalQuestions} soru</Text>
      </View>
      <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.8}>
        <Text style={styles.startText}>Çöz</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    padding: 12,
    elevation: 1,
    shadowColor: '#0d1b2a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 10,
  },
  left: { justifyContent: 'center' },
  numBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eef1fb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: { fontSize: 16, fontWeight: '800', color: '#4361ee' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#0d1b2a', marginBottom: 3 },
  meta: { fontSize: 12, color: '#9aa5b4' },
  startBtn: {
    backgroundColor: '#4361ee',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  startText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  deleteBtn: { padding: 6 },
  deleteIcon: { fontSize: 14, color: '#cbd5e0', fontWeight: '700' },
});
