import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  AddBook: undefined;
  BookDetail: { bookId: string; bookName: string };
  UploadAnswerKey: { bookId: string };
  AnswerEntry: { answerKeyId: string; bookId: string };
  Result: { sessionId: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AddBookScreenProps = NativeStackScreenProps<RootStackParamList, 'AddBook'>;
export type BookDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;
export type UploadScreenProps = NativeStackScreenProps<RootStackParamList, 'UploadAnswerKey'>;
export type AnswerEntryScreenProps = NativeStackScreenProps<RootStackParamList, 'AnswerEntry'>;
export type ResultScreenProps = NativeStackScreenProps<RootStackParamList, 'Result'>;
