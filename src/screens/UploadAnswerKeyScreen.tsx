import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { v4 as uuidv4 } from 'uuid';
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
      id: uuidv4(),
      bookId,
      testName: raw.testName || 'Test',
      topic: raw.topic || 'Genel',
      testNumber: raw.testNumber || 1,
      totalQuestions: raw.answers?.length || 0,
      answers: (raw.answers || []).map(a => ({
        questionNumber: a.questionNumber,
        correctAnswer: (['A', 'B', 'C', 'D', 'E'].includes(a.correctAnswer)
          ? a.correctAnswer
          : null) as AnswerChoice,
        topic: raw.topic || 'Genel',
      })),
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
    } catch (err) {
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
      navigation.goBack();
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LoadingOverlay visible={loading} message={loadingMsg} />

      {!preview ? (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Cevap anahtarının fotoğrafını çekin veya galeriden seçin.{'\n'}
              Groq yapay zeka ile otomatik analiz edilecek.
            </Text>
          </View>

          <TouchableOpacity style={styles.uploadBtn} onPress={showImageOptions}>
            <Text style={styles.uploadIcon}>📸</Text>
            <Text style={styles.uploadTitle}>Cevap Anahtarı Yükle</Text>
            <Text style={styles.uploadSub}>
              Kamera veya galeriden görüntü seçin
            </Text>
          </TouchableOpacity>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 İpuçları</Text>
            <Text style={styles.tipText}>• Görüntü net ve aydınlık olsun</Text>
            <Text style={styles.tipText}>• Cevap anahtarı tam görünür olsun</Text>
            <Text style={styles.tipText}>• Tek veya çoklu test desteklenir</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>
              {preview.length} test bulundu ✓
            </Text>
            <TouchableOpacity onPress={() => setPreview(null)}>
              <Text style={styles.retryText}>← Tekrar Yükle</Text>
            </TouchableOpacity>
          </View>

          {preview.map((key, idx) => (
            <View key={idx} style={styles.previewCard}>
              <Text style={styles.previewTestName}>{key.testName}</Text>
              <Text style={styles.previewMeta}>
                Konu: {key.topic} • {key.totalQuestions} soru
              </Text>
              <View style={styles.sampleAnswers}>
                {key.answers.slice(0, 10).map(a => (
                  <View key={a.questionNumber} style={styles.sampleItem}>
                    <Text style={styles.sampleQ}>{a.questionNumber}.</Text>
                    <Text style={styles.sampleA}>{a.correctAnswer}</Text>
                  </View>
                ))}
                {key.answers.length > 10 && (
                  <Text style={styles.moreText}>
                    +{key.answers.length - 10} daha
                  </Text>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Kaydet ve Ekle</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  infoBox: {
    backgroundColor: '#EAF4FD',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#2980B9',
    lineHeight: 20,
    textAlign: 'center',
  },
  uploadBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  uploadIcon: { fontSize: 52, marginBottom: 12 },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  uploadSub: { fontSize: 13, color: '#888', textAlign: 'center' },
  tipBox: {
    backgroundColor: '#fff9e6',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E67E22',
    marginBottom: 8,
  },
  tipText: { fontSize: 13, color: '#666', marginBottom: 4, lineHeight: 18 },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: { fontSize: 17, fontWeight: '700', color: '#27ae60' },
  retryText: { color: '#3498DB', fontSize: 14 },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  previewTestName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  previewMeta: { fontSize: 13, color: '#666', marginBottom: 12 },
  sampleAnswers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  sampleItem: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  sampleQ: { fontSize: 12, color: '#888' },
  sampleA: { fontSize: 12, fontWeight: '700', color: '#1a1a2e' },
  moreText: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  saveBtn: {
    backgroundColor: '#2ECC71',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
  },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
