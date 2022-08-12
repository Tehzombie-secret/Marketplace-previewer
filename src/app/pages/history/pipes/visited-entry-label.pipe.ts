import { Pipe, PipeTransform } from '@angular/core';
import { VisitedEntryType } from '../../../services/history/models/visited-entry-type.enum';

@Pipe({
  standalone: true,
  name: 'wbVisitedEntryLabel',
  pure: true,
})
export class VisitedEntryLabelPipe implements PipeTransform {

  transform(value: VisitedEntryType): string {
    const entryToLabelStrategy: Record<VisitedEntryType, string> = {
      [VisitedEntryType.CATEGORY]: 'Категория',
      [VisitedEntryType.PERSON]: 'Профиль',
      [VisitedEntryType.PRODUCT]: 'Товар',
    };
    const label = entryToLabelStrategy[value];

    return label;
  }

}
