import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-input-button-info-series',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './input-button-info-series.component.html',
  styleUrl: './input-button-info-series.component.css'
})
export class InputButtonInfoSeriesComponent {

  @Input() typeInfo: boolean = false;
  @Output() toggleTypeInfo = new EventEmitter<boolean>();


  onChangeTypeInfo(state: boolean): void {
    this.toggleTypeInfo.emit(state);
  }

}
