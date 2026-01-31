import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-button-save',
  standalone: true,
  imports: [],
  templateUrl: './button-save.component.html',
  styleUrl: './button-save.component.css'
})
export class ButtonSaveComponent {

  @Output()
  clickEmit = new EventEmitter<void>();

  onClick(): void {
    this.clickEmit.emit();
  }

}
