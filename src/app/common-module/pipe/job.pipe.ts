import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'job',
  standalone: true
})
export class JobPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) {}

  transform(value: string): string {
    const jobs: string[] = value.split('\\');
    return jobs.map((item) => this.translate.instant(`${item.trim()}`)).join(' \\ ');
  }

}