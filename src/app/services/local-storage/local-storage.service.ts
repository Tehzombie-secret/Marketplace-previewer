import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { LocalStorageKey } from './models/local-storage-key.enum';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) {
  }

  /** Use value to set entry or null to delete it */
  set(key: LocalStorageKey, value: string | null): void {
    if (value === null) {
      this.document.defaultView?.localStorage?.removeItem?.(key);
    } else {
      this.document.defaultView?.localStorage?.setItem?.(key, value);
    }
  }

  get(key: LocalStorageKey): string | null {
    return this.document.defaultView?.localStorage?.getItem(key) ?? null;
  }

}
