import RNFS from 'react-native-fs';

export async function fileToBase64(uri: string): Promise<string> {
  const cleanUri = uri.startsWith('file://') ? uri.slice(7) : uri;
  const base64 = await RNFS.readFile(cleanUri, 'base64');
  return base64;
}

export function toImageDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}
