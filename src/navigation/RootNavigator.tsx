import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import AddBookScreen from '../screens/AddBookScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import UploadAnswerKeyScreen from '../screens/UploadAnswerKeyScreen';
import AnswerEntryScreen from '../screens/AnswerEntryScreen';
import ResultScreen from '../screens/ResultScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#f0f2f5' },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Kitaplarım' }}
      />
      <Stack.Screen
        name="AddBook"
        component={AddBookScreen}
        options={{ title: 'Kitap Ekle' }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={({ route }) => ({ title: route.params.bookName })}
      />
      <Stack.Screen
        name="UploadAnswerKey"
        component={UploadAnswerKeyScreen}
        options={{ title: 'Cevap Anahtarı Yükle' }}
      />
      <Stack.Screen
        name="AnswerEntry"
        component={AnswerEntryScreen}
        options={{ title: 'Cevaplarını Gir', gestureEnabled: false }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ title: 'Sonuçlar', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
