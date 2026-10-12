// Reduce la foto antes de subirla: las cámaras actuales generan archivos de varios MB
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { NewReport } from './api';

const MAX_SIDE = 1600;
const QUALITY = 0.7;

export async function preparePhoto(asset: { uri: string; width: number; height: number }): Promise<NewReport['photo']> {
  const ctx = ImageManipulator.manipulate(asset.uri);
  // Solo se reduce; nunca se amplía una imagen pequeña
  if (Math.max(asset.width, asset.height) > MAX_SIDE) {
    ctx.resize(asset.width >= asset.height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }
  const image = await ctx.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: QUALITY });
  return { uri: result.uri, mimeType: 'image/jpeg', fileName: `reporte-${Date.now()}.jpg` };
}
