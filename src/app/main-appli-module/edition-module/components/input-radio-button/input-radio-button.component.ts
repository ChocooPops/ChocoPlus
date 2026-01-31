import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SimpleModel } from '../../../../common-module/models/simple-model';

@Component({
  selector: 'app-input-radio-button',
  standalone: true,
  imports: [],
  templateUrl: './input-radio-button.component.html',
  styleUrl: './input-radio-button.component.css'
})
export class InputRadioButtonComponent {

  @Input()
  radioButton !: SimpleModel[];

  @Input()
  group !: String;

  @Output()
  changeEmit = new EventEmitter<number>

  onRadioChange(value: number) {
    this.changeEmit.emit(value);
  }

}
