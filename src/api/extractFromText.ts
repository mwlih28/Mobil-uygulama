import { groqChat } from './groqClient';
import { TEXT_MODEL } from '../constants/groqModels';
import type { RawGroqResult } from '../types/models';

const SYSTEM_PROMPT = `Sen Türkçe ve İngilizce sınav cevap anahtarı metinlerini parse eden bir uzmansın.
Yapılandırılmış veriyi yüksek hassasiyetle çıkar. Yalnızca geçerli JSON döndür, markdown işaretlemesi kullanma.`;

function buildUserPrompt(rawText: string): string {
  return `Aşağıdaki metin bir sınav cevap anahtarı belgesinden çıkarılmıştır.
Parse et ve YALNIZCA bu JSON şemasında geçerli JSON döndür:

Tek test için:
{
  "testName": "testin tam adı",
  "topic": "konu",
  "testNumber": 1,
  "answers": [
    { "questionNumber": 1, "correctAnswer": "A" }
  ]
}

Birden fazla test için:
{
  "tests": [
    {
      "testName": "...",
      "topic": "...",
      "testNumber": 1,
      "answers": [...]
    }
  ]
}

Kurallar:
- correctAnswer şu seçeneklerden biri olmalı: A, B, C, D, E
- questionNumber 1'den başlayan ardışık tam sayı
- testNumber test adından çıkarılmalı
- Konu belirlenemezse "Genel" kullan
- JSON dışında hiçbir metin ekleme

--- HAM METİN BAŞLANGICI ---
${rawText}
--- HAM METİN SONU ---`;
}

export async function extractFromText(rawText: string): Promise<RawGroqResult> {
  const result = await groqChat(
    TEXT_MODEL,
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(rawText) },
    ],
    { max_tokens: 8192 },
  );

  return result as RawGroqResult;
}
