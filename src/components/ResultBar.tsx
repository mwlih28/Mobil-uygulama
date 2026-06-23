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
  const pct = result.percentage;
  const pctColor = pct >= 70 ? '#06d6a0' : pct >= 45 ? '#fb8500' : '#f72585';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.topic} numberOfLines={1}>{result.topic}</Text>
        <Text style={[styles.percentage, { color: pctColor }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        {correctFraction > 0 && (
          <View style={[styles.fill, styles.correct, { flex: correctFraction }]} />
        )}
        {wrongFraction > 0 && (
          <View style={[styles.fill, styles.wrong, { flex: wrongFraction }]} />
        )}
        {(1 - correctFraction - wrongFraction) > 0 && (
          <View style={[styles.fill, styles.empty, { flex: 1 - correctFraction - wrongFraction }]} />
        )}
      </View>
      <View style={styles.stats}>
        <View style={styles.statChip}>
          <View style={[styles.dot, { backgroundColor: '#06d6a0' }]} />
          <Text style={styles.statText}>{result.correctInTopic} D</Text>
        </View>
        <View style={styles.statChip}>
          <View style={[styles.dot, { backgroundColor: '#f72585' }]} />
          <Text style={styles.statText}>{result.wrongInTopic} Y</Text>
        </View>
        <View style={styles.statChip}>
          <View style={[styles.dot, { backgroundColor: '#cbd5e0' }]} />
          <Text style={styles.statText}>{result.emptyInTopic} B</Text>
        </View>
        <Text style={styles.total}>/{result.totalInTopic}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#0d1b2a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topic: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d1b2a',
    flex: 1,
  },
  percentage: {
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#f0f2f5',
    marginBottom: 10,
  },
  fill: { height: '100%' },
  correct: { backgroundColor: '#06d6a0' },
  wrong: { backgroundColor: '#f72585' },
  empty: { backgroundColor: '#e2e8f0' },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statText: { fontSize: 12, color: '#4a5568', fontWeight: '600' },
  total: { fontSize: 12, color: '#9aa5b4', marginLeft: 4 },
});
