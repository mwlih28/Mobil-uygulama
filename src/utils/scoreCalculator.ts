import type { Answer, UserAnswer, SessionResult } from '../types/models';
import { buildTopicBreakdown } from './topicAnalyzer';

export function calculateResult(
  answers: Answer[],
  userAnswers: UserAnswer[],
): SessionResult {
  const userMap = new Map<number, UserAnswer>();
  userAnswers.forEach(ua => userMap.set(ua.questionNumber, ua));

  let correctCount = 0;
  let wrongCount = 0;
  let emptyCount = 0;

  answers.forEach(answer => {
    const ua = userMap.get(answer.questionNumber);
    const userChoice = ua?.userChoice ?? null;

    if (userChoice === null) {
      emptyCount++;
    } else if (userChoice === answer.correctAnswer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const totalQuestions = answers.length;
  const score =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100 * 10) / 10
      : 0;

  return {
    totalQuestions,
    correctCount,
    wrongCount,
    emptyCount,
    score,
    topicBreakdown: buildTopicBreakdown(answers, userAnswers),
  };
}

export function calculateNet(correctCount: number, wrongCount: number): number {
  return Math.round((correctCount - wrongCount * 0.25) * 100) / 100;
}
