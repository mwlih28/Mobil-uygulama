import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import type { ResultScreenProps } from '../navigation/types';
import { sessionStorage } from '../storage/sessionStorage';
import { answerKeyStorage } from '../storage/answerKeyStorage';
import ResultBar from '../components/ResultBar';
import { calculateNet } from '../utils/scoreCalculator';
import type { TestSession, AnswerKey } from '../types/models';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#06d6a0' : score >= 45 ? '#fb8500' : '#f72585';
  return (
    <View style={styles.ringWrap}>
      <View style={[styles.ring, { borderColor: color }]}>
        <Text style={[styles.ringScore, { color }]}>{score.toFixed(0)}</Text>
        <Text style={styles.ringPct}>%</Text>
      </View>
    </View>
  );
}

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
        <ActivityIndicator size="large" color="#4361ee" />
      </View>
    );
  }

  const { result } = session;
  const net = calculateNet(result.correctCount, result.wrongCount);
  const userMap = new Map(session.userAnswers.map(ua => [ua.questionNumber, ua.userChoice]));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Score header */}
        <View style={styles.header}>
          <Text style={styles.testName} numberOfLines={2}>{answerKey.testName}</Text>
          <ScoreRing score={result.score} />

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCorrect]}>
              <Text style={styles.statNum}>{result.correctCount}</Text>
              <Text style={styles.statLbl}>Doğru</Text>
            </View>
            <View style={[styles.statCard, styles.statWrong]}>
              <Text style={styles.statNum}>{result.wrongCount}</Text>
              <Text style={styles.statLbl}>Yanlış</Text>
            </View>
            <View style={[styles.statCard, styles.statEmpty]}>
              <Text style={styles.statNum}>{result.emptyCount}</Text>
              <Text style={styles.statLbl}>Boş</Text>
            </View>
          </View>

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net:</Text>
            <Text style={[styles.netValue, net < 0 && styles.netNeg]}>{net.toFixed(2)}</Text>
            <Text style={styles.netFormula}> = D − Y×0.25</Text>
          </View>
        </View>

        {/* Topic analysis */}
        {result.topicBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Konu Analizi</Text>
            {result.topicBreakdown.map(tr => (
              <ResultBar key={tr.topic} result={tr} />
            ))}
          </View>
        )}

        {/* Answer grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cevap Karşılaştırması</Text>
          <View style={styles.gridWrap}>
            <View style={styles.grid}>
              {answerKey.answers.map(answer => {
                const userChoice = userMap.get(answer.questionNumber);
                const isEmpty = !userChoice;
                const isCorrect = userChoice === answer.correctAnswer;
                return (
                  <View
                    key={answer.questionNumber}
                    style={[
                      styles.cell,
                      isCorrect ? styles.cellCorrect : isEmpty ? styles.cellEmpty : styles.cellWrong,
                    ]}>
                    <Text style={styles.cellNum}>{answer.questionNumber}</Text>
                    <Text style={[
                      styles.cellUser,
                      isCorrect ? styles.cellUserCorrect : isEmpty ? styles.cellUserEmpty : styles.cellUserWrong,
                    ]}>
                      {userChoice ?? '—'}
                    </Text>
                    {!isCorrect && (
                      <Text style={styles.cellKey}>{answer.correctAnswer}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#d5f5e3' }]} />
            <Text style={styles.legendText}>Doğru</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#fde8e8' }]} />
            <Text style={styles.legendText}>Yanlış (üstte doğrusu)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f0f2f5' }]} />
            <Text style={styles.legendText}>Boş</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.replace('AnswerEntry', { answerKeyId: session.answerKeyId, bookId: session.bookId })}
            activeOpacity={0.85}>
            <Text style={styles.retryText}>🔄  Tekrar Çöz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.85}>
            <Text style={styles.homeText}>🏠  Ana Sayfa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },

  header: {
    backgroundColor: '#0d1b2a',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  testName: { fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 20, textAlign: 'center' },
  ringWrap: { marginBottom: 24 },
  ring: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignContent: 'center',
  },
  ringScore: { fontSize: 48, fontWeight: '900', lineHeight: 56 },
  ringPct: { fontSize: 20, fontWeight: '700', color: 'rgba(255,255,255,0.4)', alignSelf: 'flex-end', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statCorrect: { backgroundColor: 'rgba(6,214,160,0.15)' },
  statWrong: { backgroundColor: 'rgba(247,37,133,0.15)' },
  statEmpty: { backgroundColor: 'rgba(255,255,255,0.07)' },
  statNum: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 32 },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 },
  netRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  netLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  netValue: { fontSize: 22, fontWeight: '800', color: '#06d6a0' },
  netNeg: { color: '#f72585' },
  netFormula: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },

  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4a5568',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginBottom: 10,
  },

  gridWrap: { paddingHorizontal: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  cell: {
    width: 48,
    borderRadius: 10,
    padding: 5,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  cellCorrect: { backgroundColor: '#d5f5e3' },
  cellWrong: { backgroundColor: '#fde8e8' },
  cellEmpty: { backgroundColor: '#f0f2f5' },
  cellNum: { fontSize: 9, color: '#aaa', marginBottom: 2 },
  cellUser: { fontSize: 16, fontWeight: '800' },
  cellUserCorrect: { color: '#27ae60' },
  cellUserWrong: { color: '#e74c3c' },
  cellUserEmpty: { color: '#ccc' },
  cellKey: { fontSize: 9, color: '#27ae60', marginTop: 1, fontWeight: '700' },

  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12, marginBottom: 4, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 11, color: '#9aa5b4' },

  btnRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 24 },
  retryBtn: {
    flex: 1,
    backgroundColor: '#4361ee',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  homeBtn: {
    flex: 1,
    backgroundColor: '#0d1b2a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
  },
  homeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
