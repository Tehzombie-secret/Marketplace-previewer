import { Renderer2 } from '@angular/core';
import { downloadFromCanvas } from './download-from-canvas';

export function download(
  image: HTMLImageElement | null | undefined,
  name: string | null | undefined,
  renderer: Renderer2,
  document: Document,
  rotation = 0,
): void {
  if (!image) {

    return;
  }
  const canvas: HTMLCanvasElement = renderer.createElement('canvas');
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  canvas.width = rotation === 1 || rotation === 3 ? imageHeight : imageWidth;
  canvas.height = rotation === 1 || rotation === 3 ? imageWidth : imageHeight;
  const context = canvas.getContext('2d');
  if (rotation !== 0) {
    context?.translate(canvas.width / 2, canvas.height / 2);
    context?.rotate(rotation * 90 * Math.PI / 180);
    context?.drawImage(image, -imageWidth / 2, -imageHeight / 2);
  } else {
    context?.drawImage(image, 0, 0);
  }
  downloadFromCanvas(canvas, name, renderer, document);
}
