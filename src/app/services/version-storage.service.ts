import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage/local-storage.service';
import { LocalStorageKey } from './local-storage/models/local-storage-key.enum';

@Injectable({
  providedIn: 'root'
})
export class VersionStorageService {

  constructor(
    private localStorage: LocalStorageService,
  ) {
  }

  get(): number {
    return +(this.localStorage.get(LocalStorageKey.VERSION) || '1');
  }

  set(version: number) {
    this.localStorage.set(LocalStorageKey.VERSION, `${version}`);
  }

}
