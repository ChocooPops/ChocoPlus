import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'operator',
  standalone: true
})
export class OperatorPipe implements PipeTransform {

  transform(value: string): string {
    return `OPERATOR.${value}`;
  }
  
}