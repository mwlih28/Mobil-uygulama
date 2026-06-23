import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
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
      `"${answerKey.testName}" testini silmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{answerKey.testName}</Text>
        <Text style={styles.count}>{answerKey.totalQuestions} soru</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.startBtn} onPress={onStart}>
          <Text style={styles.startText}>Çöz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  count: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  startBtn: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
});
