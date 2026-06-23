import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import type { Book } from '../types/models';

interface Props {
  book: Book;
  testCount: number;
  onPress: () => void;
  onDelete: () => void;
}

export default function BookCard({ book, testCount, onPress, onDelete }: Props) {
  const handleLongPress = () => {
    Alert.alert(
      'Kitabı Sil',
      `"${book.name}" kitabını ve tüm testlerini silmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}>
      <View style={[styles.colorStripe, { backgroundColor: book.coverColor }]} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {book.name}
        </Text>
        {book.publisher ? (
          <Text style={styles.publisher} numberOfLines={1}>
            {book.publisher}
          </Text>
        ) : null}
        <Text style={styles.count}>
          {testCount} test
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  colorStripe: {
    width: 8,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  publisher: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  count: {
    fontSize: 12,
    color: '#999',
  },
});
