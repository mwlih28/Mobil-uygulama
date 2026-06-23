import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TopicResult } from '../types/models';

interface Props {
  result: TopicResult;
}

export default function ResultBar({ result }: Props) {
  const correctFraction = result.totalInTopic > 0
    ? result.correctInTopic / result.totalInTopic
    : 0;
  const wrongFraction = result.totalInTopic > 0
    ? result.wrongInTopic / result.totalInTopic
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.topic} numberOfLines={1}>{result.topic}</Text>
        <Text style={styles.percentage}>{result.percentage}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, styles.correct, { flex: correctFraction }]} />
        <View style={[styles.fill, styles.wrong, { flex: wrongFraction }]} />
        <View style={[styles.fill, styles.empty, { flex: 1 - correctFraction - wrongFraction }]} />
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendItem}>
          <Text style={styles.dot}>● </Text>
          <Text style={styles.correctText}>D: {result.correctInTopic}</Text>
        </Text>
        <Text style={styles.legendItem}>
          <Text style={styles.dot}>● </Text>
          <Text style={styles.wrongText}>Y: {result.wrongInTopic}</Text>
        </Text>
        <Text style={styles.legendItem}>
          <Text style={styles.dot}>● </Text>
          <Text style={styles.emptyText}>B: {result.emptyInTopic}</Text>
        </Text>
        <Text style={styles.legendItem}>
          <Text style={styles.totalText}>/{result.totalInTopic}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topic: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    flex: 1,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginLeft: 8,
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#eee',
  },
  fill: {
    height: '100%',
  },
  correct: { backgroundColor: '#2ECC71' },
  wrong: { backgroundColor: '#E74C3C' },
  empty: { backgroundColor: '#ddd' },
  legend: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  legendItem: {
    fontSize: 12,
    color: '#555',
  },
  dot: {
    fontSize: 10,
  },
  correctText: { color: '#27ae60' },
  wrongText: { color: '#c0392b' },
  emptyText: { color: '#888' },
  totalText: { color: '#888' },
});
