import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-scroll-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './scroll-button.component.html',
  styleUrl: './scroll-button.component.css'
})
export class ScrollButtonComponent {

  @Input() direction !: boolean; //true => left || false => right;
  @Input() displayScrollButton !: boolean;
  @Input() height: number = 0;
  @Input() width: number = 0;
  @Output() hasBeenClicked = new EventEmitter<void>

  srcImageArrow: String = 'icon/arrow.svg';

  onClick(): void {
    this.hasBeenClicked.emit();
  }

}
