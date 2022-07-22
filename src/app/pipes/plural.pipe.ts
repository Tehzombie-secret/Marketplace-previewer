import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'wbPlural',
  pure: true,
})
export class PluralPipe implements PipeTransform {

  transform(value: string | number, plurals: string[]): string {
    const stringValue = `${value}`;
    if (stringValue.charAt(stringValue.length - 2) === '1') {

      return `${stringValue} ${plurals?.[2] ?? plurals?.[1]}`;
    } else if (stringValue.endsWith('1')) {

      return `${stringValue} ${plurals?.[0]}`;
    } else if (stringValue.endsWith('2') || stringValue.endsWith('3') || stringValue.endsWith('4')) {

      return `${stringValue} ${plurals?.[1]}`;
    } else {

      return `${stringValue} ${plurals?.[2] ?? plurals?.[1]}`;
    }
  }

}
