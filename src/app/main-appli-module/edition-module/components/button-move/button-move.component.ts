import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button-move',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button-move.component.html',
  styleUrl: './button-move.component.css'
})
export class ButtonMoveComponent {
  @Input()
  direction: number = 1;

  srcImage: String = "icon/arrow.svg";
  srcImagePressed: String = "icon/arrowPressed.svg"
  isHover: boolean = false;

  onMouseEnter() {
    this.isHover = true;
  }

  onMouseLeave() {
    this.isHover = false;
  }
}
