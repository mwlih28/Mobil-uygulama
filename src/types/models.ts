export type AnswerChoice = 'A' | 'B' | 'C' | 'D' | 'E' | null;
export type FileType = 'pdf' | 'image';

export interface Book {
  id: string;
  name: string;
  publisher?: string;
  createdAt: string;
  coverColor: string;
}

export interface Answer {
  questionNumber: number;
  correctAnswer: AnswerChoice;
  topic?: string;
}

export interface AnswerKey {
  id: string;
  bookId: string;
  testName: string;
  topic: string;
  testNumber: number;
  totalQuestions: number;
  answers: Answer[];
  sourceFileType: FileType;
  createdAt: string;
}

export interface UserAnswer {
  questionNumber: number;
  userChoice: AnswerChoice;
}

export interface TestSession {
  id: string;
  answerKeyId: string;
  bookId: string;
  startedAt: string;
  completedAt?: string;
  userAnswers: UserAnswer[];
  result?: SessionResult;
}

export interface SessionResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  score: number;
  topicBreakdown: TopicResult[];
}

export interface TopicResult {
  topic: string;
  totalInTopic: number;
  correctInTopic: number;
  wrongInTopic: number;
  emptyInTopic: number;
  percentage: number;
}

export interface RawGroqAnswerKey {
  testName: string;
  topic: string;
  testNumber: number;
  answers: Array<{
    questionNumber: number;
    correctAnswer: string;
  }>;
}

export interface RawGroqResult {
  tests?: RawGroqAnswerKey[];
  testName?: string;
  topic?: string;
  testNumber?: number;
  answers?: Array<{
    questionNumber: number;
    correctAnswer: string;
  }>;
}
