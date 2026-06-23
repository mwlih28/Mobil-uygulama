import { groqChat } from './groqClient';
import { VISION_MODEL } from '../constants/groqModels';
import type { RawGroqResult } from '../types/models';

const SYSTEM_PROMPT = `Sen Türkçe ve İngilizce sınav cevap anahtarlarını fotoğraf veya taramadan okuyan bir uzmansın.
Yapılandırılmış veriyi hassas biçimde çıkar. Yalnızca geçerli JSON döndür, markdown işaretlemesi kullanma.`;

const USER_PROMPT = `Bu görüntü çoktan seçmeli bir sınavın cevap anahtarını içermektedir.
Aşağıdaki bilgileri çıkar ve YALNIZCA bu JSON şemasında geçerli JSON döndür:

{
  "testName": "testin tam adı (örn. 'Trigonometri Test 10')",
  "topic": "testin konusu (örn. 'Trigonometri')",
  "testNumber": 10,
  "answers": [
    { "questionNumber": 1, "correctAnswer": "A" },
    { "questionNumber": 2, "correctAnswer": "C" }
  ]
}

Kurallar:
- correctAnswer şu seçeneklerden biri olmalı: A, B, C, D, E
- questionNumber 1'den başlayan ardışık tam sayı olmalı
- Okunamayan veya eksik sorular atlanabilir
- testNumber test adından çıkarılmalı (örn. "Test 10" → 10)
- Konu belirlenemezse "Genel" kullan
- Görüntüde birden fazla test varsa { "tests": [...] } formatını kullan
- JSON nesnesi dışında hiçbir metin ekleme`;

export async function extractFromImage(
  base64DataUrl: string,
): Promise<RawGroqResult> {
  const result = await groqChat(
    VISION_MODEL,
    [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: base64DataUrl },
          },
          {
            type: 'text',
            text: USER_PROMPT,
          },
        ],
      },
    ],
    { max_tokens: 4096 },
  );

  return result as RawGroqResult;
}
