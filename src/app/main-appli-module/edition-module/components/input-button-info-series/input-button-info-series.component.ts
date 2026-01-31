import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input-button-info-series',
  standalone: true,
  imports: [NgClass],
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
