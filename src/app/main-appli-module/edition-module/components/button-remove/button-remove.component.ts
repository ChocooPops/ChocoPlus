import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button-remove',
  standalone: true,
  imports: [],
  templateUrl: './button-remove.component.html',
  styleUrl: './button-remove.component.css'
})
export class ButtonRemoveComponent {

  @Input()
  type: boolean = false

  @Output()
  clickEmit = new EventEmitter<void>();

  onClick(): void {
    this.clickEmit.emit();
  }

}
