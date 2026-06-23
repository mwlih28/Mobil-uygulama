import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import type { ResultScreenProps } from '../navigation/types';
import { sessionStorage } from '../storage/sessionStorage';
import { answerKeyStorage } from '../storage/answerKeyStorage';
import ResultBar from '../components/ResultBar';
import { calculateNet } from '../utils/scoreCalculator';
import type { TestSession, AnswerKey } from '../types/models';

export default function ResultScreen({ navigation, route }: ResultScreenProps) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<TestSession | null>(null);
  const [answerKey, setAnswerKey] = useState<AnswerKey | null>(null);

  useEffect(() => {
    (async () => {
      const s = await sessionStorage.getById(sessionId);
      if (!s) return;
      setSession(s);
      const ak = await answerKeyStorage.getById(s.answerKeyId);
      setAnswerKey(ak);
    })();
  }, [sessionId]);

  if (!session?.result || !answerKey) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    );
  }

  const { result } = session;
  const net = calculateNet(result.correctCount, result.wrongCount);
  const userMap = new Map(session.userAnswers.map(ua => [ua.questionNumber, ua.userChoice]));

  function getCellStyle(qNum: number, correctAnswer: string) {
    const userChoice = userMap.get(qNum);
    if (!userChoice) return styles.cellEmpty;
    if (userChoice === correctAnswer) return styles.cellCorrect;
    return styles.cellWrong;
  }

  function getCellTextStyle(qNum: number, correctAnswer: string) {
    const userChoice = userMap.get(qNum);
    if (!userChoice) return styles.cellTextEmpty;
    if (userChoice === correctAnswer) return styles.cellTextCorrect;
    return styles.cellTextWrong;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Score card */}
      <View style={styles.scoreCard}>
        <Text style={styles.testName}>{answerKey.testName}</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scorePercent}>{result.score}%</Text>
          <Text style={styles.scoreLabel}>Başarı</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, styles.chipCorrect]}>
            <Text style={styles.statNum}>{result.correctCount}</Text>
            <Text style={styles.statLabel}>Doğru</Text>
          </View>
          <View style={[styles.statChip, styles.chipWrong]}>
            <Text style={styles.statNum}>{result.wrongCount}</Text>
            <Text style={styles.statLabel}>Yanlış</Text>
          </View>
          <View style={[styles.statChip, styles.chipEmpty]}>
            <Text style={styles.statNum}>{result.emptyCount}</Text>
            <Text style={styles.statLabel}>Boş</Text>
          </View>
        </View>

        <View style={styles.netRow}>
          <Text style={styles.netLabel}>Net:</Text>
          <Text style={[styles.netValue, net < 0 && styles.netNegative]}>
            {net.toFixed(2)}
          </Text>
          <Text style={styles.netSub}> (D - Y×0.25)</Text>
        </View>
      </View>

      {/* Topic breakdown */}
      {result.topicBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konu Analizi</Text>
          {result.topicBreakdown.map(tr => (
            <ResultBar key={tr.topic} result={tr} />
          ))}
        </View>
      )}

      {/* Answer comparison grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cevap Karşılaştırması</Text>
        <View style={styles.grid}>
          {answerKey.answers.map(answer => {
            const userChoice = userMap.get(answer.questionNumber) ?? '-';
            return (
              <View
                key={answer.questionNumber}
                style={[styles.cell, getCellStyle(answer.questionNumber, answer.correctAnswer ?? '')]}>
                <Text style={styles.cellQNum}>{answer.questionNumber}</Text>
                <Text
                  style={[
                    styles.cellAnswer,
                    getCellTextStyle(answer.questionNumber, answer.correctAnswer ?? ''),
                  ]}>
                  {userChoice}
                </Text>
                <Text style={styles.cellCorrect2}>{answer.correctAnswer}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() =>
            navigation.replace('AnswerEntry', {
              answerKeyId: session.answerKeyId,
              bookId: session.bookId,
            })
          }>
          <Text style={styles.retryText}>Tekrar Çöz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.popToTop()}>
          <Text style={styles.homeText}>Ana Sayfa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scoreCard: {
    backgroundColor: '#1a1a2e',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  testName: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scorePercent: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 72,
  },
  chipCorrect: { backgroundColor: 'rgba(46,204,113,0.25)' },
  chipWrong: { backgroundColor: 'rgba(231,76,60,0.25)' },
  chipEmpty: { backgroundColor: 'rgba(255,255,255,0.1)' },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
  netRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  netLabel: { color: '#aaa', fontSize: 14 },
  netValue: { color: '#2ECC71', fontSize: 18, fontWeight: '700', marginLeft: 4 },
  netNegative: { color: '#E74C3C' },
  netSub: { color: '#666', fontSize: 12 },

  section: { marginTop: 8, marginBottom: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 6,
  },
  cell: {
    width: 52,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  cellCorrect: { backgroundColor: '#d5f5e3' },
  cellWrong: { backgroundColor: '#fde8e8' },
  cellEmpty: { backgroundColor: '#f0f0f0' },
  cellQNum: { fontSize: 10, color: '#888', marginBottom: 2 },
  cellAnswer: { fontSize: 15, fontWeight: '700' },
  cellCorrect2: { fontSize: 10, color: '#888', marginTop: 1 },
  cellTextCorrect: { color: '#27ae60' },
  cellTextWrong: { color: '#c0392b' },
  cellTextEmpty: { color: '#bbb' },

  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
  },
  retryBtn: {
    flex: 1,
    backgroundColor: '#3498DB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  homeBtn: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
