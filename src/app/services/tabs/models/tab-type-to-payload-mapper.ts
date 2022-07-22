import { TabType } from './tab-type.enum';

export class TabTypeToPayloadMapper implements Record<TabType, any> {
  [TabType.PERSON]: any;
  [TabType.PRODUCT]: any;
  [TabType.SEARCH]: any;
}
