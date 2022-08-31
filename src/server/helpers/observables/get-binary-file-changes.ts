import { readFile } from 'fs';
import { Observable, Subscriber } from 'rxjs';

export function getBinaryFileChanges(path: string): Observable<Buffer> {
  return new Observable<Buffer>((subscriber: Subscriber<Buffer>) => {
    readFile(path, (error: NodeJS.ErrnoException | null, content: Buffer) => {
      if (error) {
        subscriber.error(new Error(`Failed to read ${path}: ${error.message || error.toString()}`));
      } else {
        subscriber.next(content);
      }
      subscriber.complete();
    });
  });
}
