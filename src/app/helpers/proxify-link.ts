import { environment } from '../../environments/environment';

export function proxifyLink(url?: string | null): string {
  if (!url) {
    return '';
  }
  return `${environment.host}/api/common/rp?url=${encodeURI(url)}`;
}
