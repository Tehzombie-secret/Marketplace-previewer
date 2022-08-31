import { readFile } from 'fs';
import { Observable, Subscriber } from 'rxjs';

export function getFileChanges(path: string): Observable<string> {
  return new Observable<string>((subscriber: Subscriber<string>) => {
    readFile(path, 'utf-8', (error: NodeJS.ErrnoException | null, content: string) => {
      if (error) {
        subscriber.error(new Error(`Failed to read ${path}: ${error.message || error.toString()}`));
      } else {
        subscriber.next(content);
      }
      subscriber.complete();
    });
  });
}
