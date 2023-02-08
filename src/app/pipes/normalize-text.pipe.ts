import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'normalizeText',
  pure: true,
})
export class NormalizeTextPipe implements PipeTransform {

  transform(value: string): string {
    const lowercase = value.toLocaleLowerCase();
    const uppercased = `${lowercase.charAt(0).toLocaleUpperCase()}${lowercase.substring(1)}`;

    return uppercased;
  }
}
