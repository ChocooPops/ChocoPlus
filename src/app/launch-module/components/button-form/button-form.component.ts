import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TypeButtonModel } from '../../models/type-button.model';

@Component({
  selector: 'app-button-form',
  standalone: true,
  imports: [],
  templateUrl: './button-form.component.html',
  styleUrl: './button-form.component.css'
})
export class ButtonFormComponent {

  @Input() type !: TypeButtonModel;
  @Input() name: string = '';
  @Output() clickEmit = new EventEmitter<void>();
  TypeButtonModel = TypeButtonModel;

  onClick(): void {
    this.clickEmit.emit();
  }

}
