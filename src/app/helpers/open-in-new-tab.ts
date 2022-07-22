export function openInNewTab(url: string | null | undefined, document: Document): void {
  if (!url) {

    return;
  }
  if (url.includes('?url=') && url.includes('/api/common/rp')) {
    const segments = url.split('?url=');
    url = segments[segments.length - 1];
  }
  document.defaultView?.open?.(url, '_blank');
}
