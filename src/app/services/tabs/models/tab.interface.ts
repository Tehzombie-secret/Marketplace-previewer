import { TabTypeToPayloadMapper } from './tab-type-to-payload-mapper';
import { TabType } from './tab-type.enum';

export interface Tab<T extends TabType> {
  id: number;
  type: T;
  payload: TabTypeToPayloadMapper[T];
}
