import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
import { from, map, NEVER, Observable } from 'rxjs';
import { VisitedEntryType } from './models/visited-entry-type.enum';
import { VisitedEntry } from './models/visited-entry.interface';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor() {
    localforage.config({
      name: 'wb-preview',
      storeName: 'wb-preview',
      version: 1,
    });
  }

  hasVisitedChanges(type: VisitedEntryType, id?: string | number | null, currentDate?: Date): Observable<VisitedEntry | null> {
    if (!id) {

      return NEVER;
    }
    const key = this.getKey(id, type);

    return from(localforage.getItem<VisitedEntry>(key))
      .pipe(
        map((entry: VisitedEntry | null) => {
          if (!entry) {

            return null;
          }
          const mappedEntry = {
            ...entry,
            date: entry.date.filter((date: string) => date !== currentDate?.toISOString())
          };
          if (!entry.date.length) {

            return null;
          }

          return mappedEntry;
        }),
      );
  }

  async visit(type: VisitedEntryType, date: Date, id?: string | number | null): Promise<void> {
    if (!id) {

      return;
    }
    const key = this.getKey(id, type);
    const maybeEntry: VisitedEntry | null = await localforage.getItem<VisitedEntry>(key)
    const entry = maybeEntry ?? {
      id: key,
      date: [],
    };
    entry.date.push(date.toISOString());
    localforage.setItem(key, entry);
  }

  private getKey(id: string | number, entry: VisitedEntryType): string {
    return `wb-visited-${entry}-${id}`;
  }
}
