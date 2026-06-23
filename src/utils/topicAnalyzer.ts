import type { Answer, UserAnswer, TopicResult } from '../types/models';

export function buildTopicBreakdown(
  answers: Answer[],
  userAnswers: UserAnswer[],
): TopicResult[] {
  const userMap = new Map<number, UserAnswer>();
  userAnswers.forEach(ua => userMap.set(ua.questionNumber, ua));

  const groups = new Map<string, Answer[]>();
  answers.forEach(answer => {
    const topic = answer.topic ?? 'Genel';
    if (!groups.has(topic)) {
      groups.set(topic, []);
    }
    groups.get(topic)!.push(answer);
  });

  const results: TopicResult[] = [];

  groups.forEach((groupAnswers, topic) => {
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    groupAnswers.forEach(answer => {
      const ua = userMap.get(answer.questionNumber);
      const choice = ua?.userChoice ?? null;
      if (choice === null) {
        empty++;
      } else if (choice === answer.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const total = groupAnswers.length;
    results.push({
      topic,
      totalInTopic: total,
      correctInTopic: correct,
      wrongInTopic: wrong,
      emptyInTopic: empty,
      percentage:
        total > 0 ? Math.round((correct / total) * 100 * 10) / 10 : 0,
    });
  });

  return results.sort((a, b) => a.topic.localeCompare(b.topic, 'tr'));
}
