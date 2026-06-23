import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import type { AddBookScreenProps } from '../navigation/types';
import { generateId } from '../utils/generateId';
import { bookStorage } from '../storage/bookStorage';
import { BOOK_COLORS } from '../constants/storageKeys';

export default function AddBookScreen({ navigation }: AddBookScreenProps) {
  const [name, setName] = useState('');
  const [publisher, setPublisher] = useState('');
  const [selectedColor, setSelectedColor] = useState(BOOK_COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Eksik Alan', 'Kitap adını girmeden devam edemezsin.');
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
      Alert.alert('Hata', 'Kitap kaydedilirken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Preview card */}
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Önizleme</Text>
          <View style={styles.previewCard}>
            <View style={[styles.previewAccent, { backgroundColor: selectedColor }]}>
              <Text style={styles.previewInitial}>
                {name.trim() ? name.trim().charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName} numberOfLines={1}>
                {name.trim() || 'Kitap adı...'}
              </Text>
              <Text style={styles.previewPub} numberOfLines={1}>
                {publisher.trim() || 'Yayınevi...'}
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Kitap Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Örn: Trigonometri Soru Bankası"
            placeholderTextColor="#b0bac5"
            maxLength={100}
          />

          <Text style={styles.label}>Yayınevi</Text>
          <TextInput
            style={styles.input}
            value={publisher}
            onChangeText={setPublisher}
            placeholder="Örn: Hız Yayınları"
            placeholderTextColor="#b0bac5"
            maxLength={60}
          />

          <Text style={styles.label}>Renk Seç</Text>
          <View style={styles.colorGrid}>
            {BOOK_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.swatch,
                  { backgroundColor: color },
                  selectedColor === color && styles.swatchSelected,
                ]}
                onPress={() => setSelectedColor(color)}>
                {selectedColor === color && (
                  <Text style={styles.swatchCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>
            {saving ? 'Kaydediliyor...' : 'Kitabı Kaydet'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  scroll: { padding: 20, paddingBottom: 40 },
  previewSection: { marginBottom: 24 },
  previewLabel: { fontSize: 12, fontWeight: '600', color: '#9aa5b4', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0d1b2a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  previewAccent: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  previewInitial: { fontSize: 24, fontWeight: '800', color: '#fff' },
  previewInfo: { flex: 1 },
  previewName: { fontSize: 16, fontWeight: '700', color: '#0d1b2a', marginBottom: 4 },
  previewPub: { fontSize: 13, color: '#9aa5b4' },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#0d1b2a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0d1b2a',
  },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#0d1b2a',
  },
  swatchCheck: { fontSize: 18, color: '#fff', fontWeight: '800' },
  saveBtn: {
    backgroundColor: '#4361ee',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
