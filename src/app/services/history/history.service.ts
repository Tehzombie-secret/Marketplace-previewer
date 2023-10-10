import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
import { from, map, NEVER, Observable } from 'rxjs';
import { filterTruthy } from '../../helpers/observables/filter-truthy';
import { truthy } from '../../helpers/truthy';
import { APIPlatform } from '../api/models/api-platform.enum';
import { HistoryEntry } from './models/history-entry.interface';
import { VisitRequest } from './models/visit-request.interface';
import { VisitedEntryType } from './models/visited-entry-type.enum';
import { VisitedEntry } from './models/visited-entry.interface';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private readonly config = {
    name: 'wb-preview',
    version: 1,
  };
  private readonly historyEntries = localforage.createInstance({ ...this.config, storeName: 'history' });
  private readonly visitedEntries = localforage.createInstance({ ...this.config, storeName: 'visited' });
  private readonly legacyVisitedEntries = ['wb-preview', 'wb_preview'];

  constructor() {
    this.legacyVisitedEntries.forEach((storeName: string) => {
      const instance = localforage.createInstance({ ...this.config, storeName });
      instance.keys().then((keys: string[]) => {
        keys.forEach(async (key: string) => {
          const item = await instance.getItem(key);
          await this.visitedEntries.setItem(key, item);
          await instance.removeItem(key);
        });
      });
    });
  }

  getHistoryLengthChanges(): Observable<number> {
    return from(this.historyEntries.length());
  }

  getHistoryChanges(take: number, skip: number): Observable<HistoryEntry[]> {
    const entries: HistoryEntry[] = [];
    const iteratee = this.historyEntries.iterate((value: VisitedEntry, key: string, index: number) => {
      if (index >= skip) {
        const entry: HistoryEntry = {
          ...value,
          date: +key,
        };
        entries.push(entry);
      }
      if (entries.length >= take) {

        return entries;
      }

      return undefined;
    }).then(() => entries);

    return from(iteratee).pipe(filterTruthy());
  }

  hasVisitedChanges(type: VisitedEntryType, platform: APIPlatform, id?: string | number | null, currentDate?: Date): Observable<VisitedEntry | null> {
    if (!id) {

      return NEVER;
    }
    const key = this.getKey(platform, id, type);

    return from(this.visitedEntries.getItem<VisitedEntry>(key))
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

  async visit(request: VisitRequest): Promise<void> {
    const ids = request.ids || [];
    if (!ids.length) {

      return;
    }
    ids
      .filter(truthy)
      .forEach(async (id: string | number) => {
        const key = this.getKey(request.platform, id, request.type);
        const maybeEntry: VisitedEntry | null = await this.visitedEntries.getItem<VisitedEntry>(key);
        const entry: VisitedEntry = {
          id: key,
          date: [],
          type: maybeEntry?.type || request.type,
          platform: maybeEntry?.platform || request.platform,
          title: request.title || maybeEntry?.title,
          photo: request.photo || maybeEntry?.photo,
          sortByDate: request?.sortByDate ?? true,
        };
        entry.date.push(request.date.toISOString());
        await this.visitedEntries.setItem(key, entry);
        await this.historyEntries.setItem(`${+new Date()}`, { ...entry, id });
      });
  }

  private getKey(platform: APIPlatform, id: string | number, entry: VisitedEntryType): string {
    return `${platform}-visited-${entry}-${id}`;
  }
}
