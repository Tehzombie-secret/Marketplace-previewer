import { Renderer2 } from '@angular/core';

export function downloadFromCanvas(
  canvas: HTMLCanvasElement | null | undefined,
  name: string | null | undefined,
  renderer: Renderer2,
  document: Document,
): void {
  if (!canvas) {

    return;
  }
  canvas.toBlob((blob: Blob | null) => {
    if (!blob) {

      return;
    }
    const url = URL.createObjectURL(blob);
    const anchor = renderer.createElement('a');
    renderer.setStyle(anchor, 'display', 'none');
    renderer.setAttribute(anchor, 'href', url);
    renderer.setAttribute(anchor, 'download', `${name ?? 'photo'}.jpg`);
    renderer.appendChild(document.body, anchor);
    anchor.click();
    URL.revokeObjectURL(url);
  }, 'image/jpeg', 1);
}
