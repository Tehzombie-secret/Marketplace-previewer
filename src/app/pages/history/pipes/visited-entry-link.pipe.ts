import { Pipe, PipeTransform } from '@angular/core';
import { ROUTE_PATH } from '../../../constants/route-path.const';
import { HistoryEntry } from '../../../services/history/models/history-entry.interface';
import { VisitedEntryType } from '../../../services/history/models/visited-entry-type.enum';

@Pipe({
  standalone: true,
  name: 'wbVisitedEntryLink',
})
export class VisitedEntryLinkPipe implements PipeTransform {

  transform(value: HistoryEntry): string[] {
    const entryToLinkStrategy: Record<VisitedEntryType, string> = {
      [VisitedEntryType.CATEGORY]: ROUTE_PATH.CATALOG,
      [VisitedEntryType.PERSON]: ROUTE_PATH.PERSON,
      [VisitedEntryType.PRODUCT]: ROUTE_PATH.PRODUCT,
    };
    const link = [`/${value.platform}`, entryToLinkStrategy[value.type], value.id];

    return link;
  }

}
