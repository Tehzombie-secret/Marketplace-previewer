import { Dirent, readdir } from 'fs';
import { join } from 'path';
import { Observable, of, Subscriber } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Stream of absolute file paths located inside a specified path,
 * one file path per emit
 */
export function getFilePathChanges(folderPath: string, recursively = false): Observable<string> {
  return getFilePathStreamChanges(folderPath, recursively)
    .pipe(
      mergeMap((filenames$: Observable<string>) => filenames$),
    );
}

function getFilePathStreamChanges(folderPath: string, recursively: boolean): Observable<Observable<string>> {
  return new Observable<Observable<string>>((subscriber: Subscriber<Observable<string>>) => {
    readdir(folderPath, { withFileTypes: true }, (error: NodeJS.ErrnoException | null, files: Dirent[]) => {
      if (error) {
        subscriber.error(new Error(`Failed to read folder ${folderPath}: ${error.message || error.toString()}`));

        return;
      }
      files.forEach((file: Dirent) => {
        if (file.isDirectory()) {
          if (recursively) {
            const nextFolderPath = join(folderPath, file.name);
            const folderFilenames$ = getFilePathStreamChanges(nextFolderPath, recursively)
              .pipe(
                mergeMap((filenames$: Observable<string>) => filenames$),
              );
            subscriber.next(folderFilenames$);
          }
        } else {
          subscriber.next(of(join(folderPath, file.name)));
        }
      });
      subscriber.complete();
    });
  });
}
