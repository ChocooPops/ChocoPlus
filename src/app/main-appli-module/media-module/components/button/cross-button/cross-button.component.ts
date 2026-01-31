import { Component } from '@angular/core';

@Component({
  selector: 'app-cross-button',
  standalone: true,
  imports: [],
  templateUrl: './cross-button.component.html',
  styleUrl: '../../../../common-module/styles/movie-button.css'
})
export class CrossButtonComponent {
  isHover: boolean = false;
  srcImageEnter: String = "icon/crossPressed.svg";
  srcImageLeave: String = "icon/cross.svg"

  onMouseEnter(): void {
    this.isHover = true;
  }

  onMouseLeave(): void {
    this.isHover = false;
  }

}
