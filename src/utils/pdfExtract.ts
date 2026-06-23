import { Buffer } from 'buffer';

// pdfjs-dist legacy build — no canvas or web worker required
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

pdfjsLib.GlobalWorkerOptions.workerSrc = '';

export async function extractTextFromPdfBase64(base64: string): Promise<string> {
  const binaryString = Buffer.from(base64, 'base64');
  const arrayBuffer = binaryString.buffer.slice(
    binaryString.byteOffset,
    binaryString.byteOffset + binaryString.byteLength,
  ) as ArrayBuffer;

  const pdf = await pdfjsLib
    .getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    })
    .promise;

  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: { str?: string }) => item.str ?? '')
      .join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n');
}
