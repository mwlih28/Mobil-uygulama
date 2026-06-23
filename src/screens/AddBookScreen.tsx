import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { generateId } from '../utils/generateId';
import type { AddBookScreenProps } from '../navigation/types';
import { bookStorage } from '../storage/bookStorage';
import { BOOK_COLORS } from '../constants/storageKeys';

export default function AddBookScreen({ navigation }: AddBookScreenProps) {
  const [name, setName] = useState('');
  const [publisher, setPublisher] = useState('');
  const [selectedColor, setSelectedColor] = useState(BOOK_COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Hata', 'Kitap adı zorunludur.');
      return;
    }

    setSaving(true);
    try {
      await bookStorage.save({
        id: generateId(),
        name: name.trim(),
        publisher: publisher.trim() || undefined,
        createdAt: new Date().toISOString(),
        coverColor: selectedColor,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Hata', 'Kitap kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Kitap Adı *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Örn: Matematik Soru Bankası 2024"
          placeholderTextColor="#aaa"
          maxLength={100}
        />

        <Text style={styles.label}>Yayınevi (opsiyonel)</Text>
        <TextInput
          style={styles.input}
          value={publisher}
          onChangeText={setPublisher}
          placeholder="Örn: Hız Yayınları"
          placeholderTextColor="#aaa"
          maxLength={60}
        />

        <Text style={styles.label}>Renk</Text>
        <View style={styles.colorRow}>
          {BOOK_COLORS.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                selectedColor === color && styles.selectedSwatch,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={styles.saveBtnText}>
            {saving ? 'Kaydediliyor...' : 'Kitabı Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a2e',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectedSwatch: {
    borderWidth: 3,
    borderColor: '#1a1a2e',
  },
  saveBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
