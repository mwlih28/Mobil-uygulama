import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { generateId } from '../utils/generateId';
import type { AnswerEntryScreenProps } from '../navigation/types';
import { answerKeyStorage } from '../storage/answerKeyStorage';
import { sessionStorage } from '../storage/sessionStorage';
import { calculateResult } from '../utils/scoreCalculator';
import type { AnswerKey, UserAnswer, AnswerChoice } from '../types/models';

const CHOICES: NonNullable<AnswerChoice>[] = ['A', 'B', 'C', 'D', 'E'];

const CHOICE_COLORS: Record<string, string> = {
  A: '#4361ee',
  B: '#7209b7',
  C: '#f72585',
  D: '#fb8500',
  E: '#06d6a0',
};

export default function AnswerEntryScreen({ navigation, route }: AnswerEntryScreenProps) {
  const { answerKeyId, bookId } = route.params;
  const [answerKey, setAnswerKey] = useState<AnswerKey | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, AnswerChoice>>(new Map());
  const sessionId = useRef(generateId());
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    answerKeyStorage.getById(answerKeyId).then(key => { if (key) setAnswerKey(key); });
  }, [answerKeyId]);

  useEffect(() => {
    if (!answerKey) return;
    const progress = (currentIndex + 1) / answerKey.totalQuestions;
    Animated.timing(progressAnim, { toValue: progress, duration: 250, useNativeDriver: false }).start();
  }, [currentIndex, answerKey]);

  function animateTransition(fn: () => void) {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    fn();
  }

  if (!answerKey) return null;

  const total = answerKey.answers.length;
  const currentAnswer = answerKey.answers[currentIndex];
  const currentUserChoice = userAnswers.get(currentAnswer?.questionNumber) ?? null;
  const answeredCount = userAnswers.size;
  const isLast = currentIndex === total - 1;

  function selectChoice(choice: AnswerChoice) {
    if (!currentAnswer) return;
    const updated = new Map(userAnswers);
    updated.set(currentAnswer.questionNumber, choice);
    setUserAnswers(updated);
    if (currentIndex < total - 1) {
      setTimeout(() => animateTransition(() => setCurrentIndex(i => i + 1)), 250);
    }
  }

  function skipQuestion() {
    if (!currentAnswer) return;
    const updated = new Map(userAnswers);
    updated.set(currentAnswer.questionNumber, null);
    setUserAnswers(updated);
    if (currentIndex < total - 1) animateTransition(() => setCurrentIndex(i => i + 1));
  }

  async function saveAndNavigate() {
    const uaList: UserAnswer[] = answerKey!.answers.map(a => ({
      questionNumber: a.questionNumber,
      userChoice: userAnswers.get(a.questionNumber) ?? null,
    }));
    const result = calculateResult(answerKey!.answers, uaList);
    const session = {
      id: sessionId.current, answerKeyId, bookId,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      userAnswers: uaList, result,
    };
    await sessionStorage.save(session);
    navigation.replace('Result', { sessionId: sessionId.current });
  }

  function finishTest() {
    const unanswered = total - answeredCount;
    if (unanswered > 0) {
      Alert.alert(
        'Testi Bitir',
        `${unanswered} soru boş kalacak. Devam etmek istiyor musun?`,
        [{ text: 'Geri Dön', style: 'cancel' }, { text: 'Bitir', onPress: saveAndNavigate }],
      );
    } else {
      saveAndNavigate();
    }
  }

  const progressPercent = Math.round((answeredCount / total) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.testLabel} numberOfLines={1}>{answerKey.testName}</Text>
          <Text style={styles.progressLabel}>{answeredCount}/{total} cevaplandı</Text>
        </View>
        <View style={styles.counterCircle}>
          <Text style={styles.counterText}>{currentIndex + 1}</Text>
          <Text style={styles.counterTotal}>/{total}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
        <Text style={styles.progressPct}>{progressPercent}%</Text>
      </View>

      {/* Question display */}
      <Animated.View style={[styles.questionSection, { opacity: fadeAnim }]}>
        <Text style={styles.questionLabel}>Soru</Text>
        <Text style={styles.questionNumber}>{currentAnswer?.questionNumber}</Text>
      </Animated.View>

      {/* Answer bubbles */}
      <View style={styles.bubblesContainer}>
        {CHOICES.map(letter => {
          const isSelected = currentUserChoice === letter;
          const color = CHOICE_COLORS[letter];
          return (
            <TouchableOpacity
              key={letter}
              style={[
                styles.bubble,
                isSelected && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => selectChoice(letter)}
              activeOpacity={0.75}>
              <Text style={[styles.bubbleLetter, isSelected && styles.bubbleLetterActive]}>
                {letter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => currentIndex > 0 && animateTransition(() => setCurrentIndex(i => i - 1))}
          disabled={currentIndex === 0}>
          <Text style={styles.navBtnText}>‹ Geri</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={skipQuestion}>
          <Text style={styles.skipText}>Boş Bırak</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity style={styles.finishBtn} onPress={finishTest}>
            <Text style={styles.finishText}>Bitir ✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => animateTransition(() => setCurrentIndex(i => i + 1))}>
            <Text style={styles.navBtnText}>İleri ›</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  topLeft: { flex: 1, marginRight: 12 },
  testLabel: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 3 },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  counterCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  counterTotal: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginLeft: 2 },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4361ee',
    borderRadius: 3,
  },
  progressPct: { position: 'absolute', right: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  questionSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionLabel: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  questionNumber: { fontSize: 100, fontWeight: '900', color: '#fff', lineHeight: 110 },
  bubblesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bubble: {
    width: 58,
    height: 58,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleLetter: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  bubbleLetterActive: { color: '#fff' },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  navBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  skipText: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  finishBtn: {
    backgroundColor: '#06d6a0',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
    elevation: 4,
    shadowColor: '#06d6a0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  finishText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
