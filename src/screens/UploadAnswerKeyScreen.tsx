import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { generateId } from '../utils/generateId';
import type { UploadScreenProps } from '../navigation/types';
import { fileToBase64, toImageDataUrl } from '../utils/fileToBase64';
import { extractFromImage } from '../api/extractFromImage';
import { answerKeyStorage } from '../storage/answerKeyStorage';
import LoadingOverlay from '../components/LoadingOverlay';
import type {
  AnswerKey,
  RawGroqAnswerKey,
  RawGroqResult,
  AnswerChoice,
} from '../types/models';

export default function UploadAnswerKeyScreen({
  navigation,
  route,
}: UploadScreenProps) {
  const { bookId } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [preview, setPreview] = useState<AnswerKey[] | null>(null);

  function rawToAnswerKey(raw: RawGroqAnswerKey): AnswerKey {
    return {
      id: generateId(),
      bookId,
      testName: raw.testName || 'Test',
      topic: raw.topic || 'Genel',
      testNumber: raw.testNumber || 1,
      totalQuestions: raw.answers?.length || 0,
      answers: (raw.answers || []).map(a => {
        const upper = (a.correctAnswer ?? '').toUpperCase().trim();
        return {
          questionNumber: a.questionNumber,
          correctAnswer: (['A', 'B', 'C', 'D', 'E'].includes(upper)
            ? upper
            : null) as AnswerChoice,
          topic: raw.topic || 'Genel',
        };
      }),
      sourceFileType: 'image',
      createdAt: new Date().toISOString(),
    };
  }

  function parseGroqResult(result: RawGroqResult): AnswerKey[] {
    let raws: RawGroqAnswerKey[] = [];
    if (result.tests && Array.isArray(result.tests)) {
      raws = result.tests as RawGroqAnswerKey[];
    } else if (result.testName) {
      raws = [result as RawGroqAnswerKey];
    }
    return raws.map(r => rawToAnswerKey(r));
  }

  async function handlePickImage(source: 'camera' | 'gallery') {
    try {
      const fn = source === 'camera' ? launchCamera : launchImageLibrary;
      const result = await fn({ mediaType: 'photo', quality: 0.9 });
      if (result.didCancel || !result.assets?.[0]?.uri) return;

      const asset = result.assets[0];
      setLoading(true);
      setLoadingMsg('Görüntü okunuyor...');
      const base64 = await fileToBase64(asset.uri!);
      const mimeType = asset.type || 'image/jpeg';
      const dataUrl = toImageDataUrl(base64, mimeType);

      setLoadingMsg('Groq analiz ediyor...');
      const groqResult = await extractFromImage(dataUrl);
      const keys = parseGroqResult(groqResult);

      if (keys.length === 0) {
        Alert.alert(
          'Analiz Başarısız',
          'Cevap anahtarı bulunamadı. Görüntünün net olduğundan emin olup tekrar deneyin.',
        );
        setLoading(false);
        return;
      }

      setPreview(keys);
    } catch {
      Alert.alert('Hata', 'Görüntü işlenirken bir hata oluştu. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!preview || preview.length === 0) return;
    try {
      setLoading(true);
      setLoadingMsg('Kaydediliyor...');
      for (const key of preview) {
        await answerKeyStorage.save(key);
      }
      setLoading(false);
      Alert.alert(
        'Kaydedildi',
        `${preview.length} test başarıyla eklendi.`,
        [
          { text: 'Başka Test Ekle', onPress: () => setPreview(null) },
          { text: 'Kitaba Dön', onPress: () => navigation.goBack() },
        ],
      );
    } catch {
      Alert.alert('Hata', 'Kaydedilirken hata oluştu.');
      setLoading(false);
    }
  }

  function showImageOptions() {
    Alert.alert('Görüntü Seç', 'Cevap anahtarını nasıl yüklemek istersiniz?', [
      { text: 'Kameradan Çek', onPress: () => handlePickImage('camera') },
      { text: 'Galeriden Seç', onPress: () => handlePickImage('gallery') },
      { text: 'İptal', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />
      <LoadingOverlay visible={loading} message={loadingMsg} />
      <ScrollView contentContainerStyle={styles.content}>

        {!preview ? (
          <>
            {/* Upload card */}
            <TouchableOpacity
              style={styles.uploadCard}
              onPress={showImageOptions}
              activeOpacity={0.88}>
              <View style={styles.uploadIconWrap}>
                <Text style={styles.uploadEmoji}>📸</Text>
              </View>
              <Text style={styles.uploadTitle}>Cevap Anahtarı Yükle</Text>
              <Text style={styles.uploadSub}>
                Kamera veya galeriden fotoğraf çek,{'\n'}yapay zeka otomatik analiz eder
              </Text>
              <View style={styles.uploadPill}>
                <Text style={styles.uploadPillText}>Fotoğraf Seç</Text>
              </View>
            </TouchableOpacity>

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handlePickImage('camera')}
                activeOpacity={0.8}>
                <Text style={styles.actionIcon}>📷</Text>
                <Text style={styles.actionLabel}>Kamera</Text>
              </TouchableOpacity>
              <View style={styles.actionDivider} />
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handlePickImage('gallery')}
                activeOpacity={0.8}>
                <Text style={styles.actionIcon}>🖼️</Text>
                <Text style={styles.actionLabel}>Galeri</Text>
              </TouchableOpacity>
            </View>

            {/* Tips */}
            <View style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={styles.tipDot} />
                <Text style={styles.tipTitle}>İpuçları</Text>
              </View>
              <View style={styles.tipList}>
                <Text style={styles.tipItem}>Görüntü net ve aydınlık olsun</Text>
                <Text style={styles.tipItem}>Cevap anahtarı tam görünür olsun</Text>
                <Text style={styles.tipItem}>Tek veya çoklu test desteklenir</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Preview header */}
            <View style={styles.previewHeaderRow}>
              <View style={styles.successBadge}>
                <Text style={styles.successBadgeText}>{preview.length} test bulundu</Text>
              </View>
              <TouchableOpacity onPress={() => setPreview(null)} style={styles.retryBtn}>
                <Text style={styles.retryText}>Tekrar Yükle</Text>
              </TouchableOpacity>
            </View>

            {/* Preview cards */}
            {preview.map((key, idx) => (
              <View key={idx} style={styles.previewCard}>
                <View style={styles.previewCardTop}>
                  <View style={styles.previewNumBadge}>
                    <Text style={styles.previewNumText}>{key.testNumber}</Text>
                  </View>
                  <View style={styles.previewCardInfo}>
                    <Text style={styles.previewTestName} numberOfLines={2}>{key.testName}</Text>
                    <Text style={styles.previewMeta}>{key.topic}  ·  {key.totalQuestions} soru</Text>
                  </View>
                </View>

                <View style={styles.answerGrid}>
                  {key.answers.slice(0, 12).map(a => (
                    <View key={a.questionNumber} style={styles.answerChip}>
                      <Text style={styles.answerChipQ}>{a.questionNumber}</Text>
                      <Text style={styles.answerChipA}>{a.correctAnswer ?? '?'}</Text>
                    </View>
                  ))}
                  {key.answers.length > 12 && (
                    <View style={[styles.answerChip, styles.answerChipMore]}>
                      <Text style={styles.moreText}>+{key.answers.length - 12}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* Save button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Kaydet ve Ekle</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20, paddingBottom: 48 },

  uploadCard: {
    backgroundColor: '#0d1b2a',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#0d1b2a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  uploadIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadEmoji: { fontSize: 38 },
  uploadTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' },
  uploadSub: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  uploadPill: {
    backgroundColor: '#4361ee',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  uploadPillText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  actionRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#0d1b2a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  actionDivider: { width: 1, backgroundColor: '#f0f2f5', marginVertical: 12 },
  actionIcon: { fontSize: 26, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#4a5568' },

  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 1,
    shadowColor: '#0d1b2a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fb8500' },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#4a5568', textTransform: 'uppercase', letterSpacing: 0.6 },
  tipList: { gap: 8 },
  tipItem: { fontSize: 14, color: '#718096', lineHeight: 20, paddingLeft: 4 },

  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  successBadge: {
    backgroundColor: '#06d6a0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  successBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  retryText: { fontSize: 13, color: '#4a5568', fontWeight: '600' },

  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#0d1b2a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  previewCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  previewNumBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef1fb',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  previewNumText: { fontSize: 18, fontWeight: '800', color: '#4361ee' },
  previewCardInfo: { flex: 1 },
  previewTestName: { fontSize: 15, fontWeight: '700', color: '#0d1b2a', marginBottom: 4 },
  previewMeta: { fontSize: 13, color: '#9aa5b4' },

  answerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  answerChip: {
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 38,
  },
  answerChipMore: { backgroundColor: '#eef1fb' },
  answerChipQ: { fontSize: 9, color: '#aaa', marginBottom: 1 },
  answerChipA: { fontSize: 13, fontWeight: '800', color: '#0d1b2a' },
  moreText: { fontSize: 12, fontWeight: '700', color: '#4361ee' },

  saveBtn: {
    backgroundColor: '#4361ee',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    elevation: 6,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
