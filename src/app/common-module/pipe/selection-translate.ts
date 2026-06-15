import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'selectiontranslate',
  standalone: true
})
export class SelectionTranslatePipe implements PipeTransform {

    constructor(private readonly translate: TranslateService) {}

    transform(value: string): string {
        const key: string = value.toUpperCase();
        const translated = this.translate.instant(key);
        if (translated === key) {
            return value;
        } else {
            return translated.charAt(0).toUpperCase() + translated.slice(1);
        }
    }

}