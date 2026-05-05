import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'join',
  standalone: true
})
export class JoinPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) {}

  transform(value: {name: string, value: any}[] | null | undefined, separator: string = ', '): string {
    if (!value || !Array.isArray(value)) {
      return '';
    }
    return value.map((item) => this.translate.instant(item.name)).join(separator);
  }
  
}