import { Component, Output, EventEmitter } from '@angular/core';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-bt-quality',
  standalone: true,
  imports: [BtClassicComponent, NgClass],
  templateUrl: './bt-quality.component.html',
  styleUrl: './bt-quality.component.css'
})
export class BtQualityComponent {

  @Output() setDisplayControls = new EventEmitter<boolean>();
  srcImage: string = 'icon/controls/quality.svg';
  state: boolean = false;
  isHovering: boolean = false;

  onClick(): void {
    this.state = !this.state;
  }

  onMouseEnter(): void {
    this.isHovering = true;
    this.setDisplayControls.emit(true);
  }

  onMouseLeaving(): void {
    this.isHovering = false;
    this.setDisplayControls.emit(false);
  }

}
