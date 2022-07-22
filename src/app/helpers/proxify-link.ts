import { environment } from '../../environments/environment';

export function proxifyLink(url: string): string {
  return `${environment.host}/api/common/rp?url=${encodeURI(url)}`;
}
