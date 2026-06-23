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
        headerStyle: { backgroundColor: '#0d1b2a' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#f5f7fa' },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
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
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ headerShown: false, headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
