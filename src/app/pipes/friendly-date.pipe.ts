import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'wbFriendlyDate',
  pure: true,
})
export class FriendlyDatePipe implements PipeTransform {

  transform(value?: string | number | null): string {
    if (!value) {

      return '';
    }
    const date = new Date(value);
    const beautifulDate = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(date);

    return beautifulDate;
  }

}
