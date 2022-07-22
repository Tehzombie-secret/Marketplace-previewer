import { Injectable } from '@angular/core';
import { BehaviorSubject, NEVER, Observable } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LocalStorageKey } from '../local-storage/models/local-storage-key.enum';
import { SettingsKeyToTypeMapper } from './constants/settings-key-to-type-mapper';
import { SettingsKey } from './models/settings-key.enum';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {

  private readonly galleryMode$ = new BehaviorSubject<boolean>(Boolean(this.localStorage.get(LocalStorageKey.GALLERY_MODE)));

  constructor(
    private localStorage: LocalStorageService,
  ) {
  }

  get<T extends SettingsKey>(key: T): SettingsKeyToTypeMapper[T] | null {
    const changeStrategy: Record<SettingsKey, () => SettingsKeyToTypeMapper[T]> = {
      [SettingsKey.GALLERY_MODE]: () => this.galleryMode$.getValue(),
    };
    const value = changeStrategy[key]?.() ?? null;

    return value;
  }

  getChanges<T extends SettingsKey>(key: T): Observable<SettingsKeyToTypeMapper[T]> {
    const changeStrategy: Record<SettingsKey, () => Observable<SettingsKeyToTypeMapper[T]>> = {
      [SettingsKey.GALLERY_MODE]: () => this.galleryMode$.asObservable(),
    };
    const changes$ = changeStrategy[key]?.() ?? NEVER;

    return changes$;
  }

  set<T extends SettingsKey>(key: T, value: SettingsKeyToTypeMapper[T]): void {
    const setterStrategy: Record<SettingsKey, () => void> = {
      [SettingsKey.GALLERY_MODE]: () => {
        this.localStorage.set(LocalStorageKey.GALLERY_MODE, value ? '1' : null);
        this.galleryMode$.next(value);
      },
    };
    setterStrategy[key]?.();
  }


}
