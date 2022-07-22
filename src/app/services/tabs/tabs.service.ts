import { Injectable } from '@angular/core';
import { TabTypeToPayloadMapper } from './models/tab-type-to-payload-mapper';
import { TabType } from './models/tab-type.enum';

@Injectable({
  providedIn: 'root',
})
export class TabsService {

  addTab<T extends TabType>(content: T, payload: TabTypeToPayloadMapper[T]): void {

  }

  removeTab(id: number): void {

  }

}
