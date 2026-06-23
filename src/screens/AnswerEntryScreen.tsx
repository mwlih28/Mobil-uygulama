import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import type { AnswerEntryScreenProps } from '../navigation/types';
import { answerKeyStorage } from '../storage/answerKeyStorage';
import { sessionStorage } from '../storage/sessionStorage';
import { calculateResult } from '../utils/scoreCalculator';
import AnswerBubble from '../components/AnswerBubble';
import type { AnswerKey, UserAnswer, AnswerChoice } from '../types/models';

const CHOICES: NonNullable<AnswerChoice>[] = ['A', 'B', 'C', 'D', 'E'];

export default function AnswerEntryScreen({ navigation, route }: AnswerEntryScreenProps) {
  const { answerKeyId, bookId } = route.params;
  const [answerKey, setAnswerKey] = useState<AnswerKey | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, AnswerChoice>>(new Map());
  const sessionId = useRef(uuidv4());
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    answerKeyStorage.getById(answerKeyId).then(key => {
      if (key) setAnswerKey(key);
    });
  }, [answerKeyId]);

  useEffect(() => {
    if (!answerKey) return;
    const progress = (currentIndex + 1) / answerKey.totalQuestions;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, answerKey]);

  if (!answerKey) return null;

  const total = answerKey.answers.length;
  const currentAnswer = answerKey.answers[currentIndex];
  const currentUserChoice = userAnswers.get(currentAnswer?.questionNumber) ?? null;

  function selectChoice(choice: AnswerChoice) {
    if (!currentAnswer) return;
    const updated = new Map(userAnswers);
    updated.set(currentAnswer.questionNumber, choice);
    setUserAnswers(updated);

    if (currentIndex < total - 1) {
      setTimeout(() => setCurrentIndex(i => i + 1), 280);
    }
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }

  function skipQuestion() {
    if (!currentAnswer) return;
    const updated = new Map(userAnswers);
    updated.set(currentAnswer.questionNumber, null);
    setUserAnswers(updated);
    if (currentIndex < total - 1) setCurrentIndex(i => i + 1);
  }

  async function finishTest() {
    Alert.alert(
      'Testi Bitir',
      `${total - userAnswers.size} soru boş kalacak. Devam etmek istiyor musunuz?`,
      [
        { text: 'Geri Dön', style: 'cancel' },
        { text: 'Bitir', onPress: saveAndNavigate },
      ],
    );
  }

  async function saveAndNavigate() {
    const uaList: UserAnswer[] = answerKey!.answers.map(a => ({
      questionNumber: a.questionNumber,
      userChoice: userAnswers.get(a.questionNumber) ?? null,
    }));

    const result = calculateResult(answerKey!.answers, uaList);

    const session = {
      id: sessionId.current,
      answerKeyId,
      bookId,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      userAnswers: uaList,
      result,
    };

    await sessionStorage.save(session);
    navigation.replace('Result', { sessionId: sessionId.current });
  }

  const isLast = currentIndex === total - 1;
  const answeredCount = userAnswers.size;

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.testName} numberOfLines={1}>
          {answerKey.testName}
        </Text>
        <Text style={styles.questionCounter}>
          {currentIndex + 1} / {total}
        </Text>
      </View>

      {/* Question number */}
      <View style={styles.questionBox}>
        <Text style={styles.questionLabel}>Soru</Text>
        <Text style={styles.questionNumber}>{currentAnswer?.questionNumber}</Text>
      </View>

      {/* Answer bubbles */}
      <View style={styles.bubblesRow}>
        {CHOICES.map(letter => (
          <AnswerBubble
            key={letter}
            letter={letter}
            state={currentUserChoice === letter ? 'selected' : 'idle'}
            onPress={() => selectChoice(letter)}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={goBack}
          disabled={currentIndex === 0}>
          <Text style={styles.navBtnText}>◀ Geri</Text>
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
            onPress={() => setCurrentIndex(i => i + 1)}>
            <Text style={styles.navBtnText}>İleri ▶</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer stats */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Cevaplanan: {answeredCount} / {total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  progressContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498DB',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  questionBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  questionLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#1a1a2e',
    lineHeight: 80,
  },
  bubblesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 10,
  },
  navBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  skipBtn: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  skipText: { fontSize: 13, color: '#888' },
  finishBtn: {
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
  },
  finishText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: { fontSize: 13, color: '#aaa' },
});
