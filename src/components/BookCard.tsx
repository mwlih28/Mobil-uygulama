import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
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
      `"${book.name}" ve tüm testleri silinecek.`,
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
      activeOpacity={0.75}>
      <View style={[styles.accent, { backgroundColor: book.coverColor }]}>
        <Text style={styles.initial}>{book.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{book.name}</Text>
        {book.publisher ? (
          <Text style={styles.publisher} numberOfLines={1}>{book.publisher}</Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{testCount} test</Text>
          </View>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#0d1b2a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  accent: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  initial: { fontSize: 22, fontWeight: '800', color: '#fff' },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#0d1b2a', marginBottom: 3 },
  publisher: { fontSize: 12, color: '#9aa5b4', marginBottom: 6 },
  footer: { flexDirection: 'row' },
  badge: {
    backgroundColor: '#eef1fb',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#4361ee' },
  arrow: { fontSize: 24, color: '#c5cdd8', fontWeight: '300' },
});
