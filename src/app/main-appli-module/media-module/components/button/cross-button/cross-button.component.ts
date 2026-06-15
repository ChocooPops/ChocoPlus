import { Component } from '@angular/core';

@Component({
  selector: 'app-cross-button',
  standalone: true,
  imports: [],
  templateUrl: './cross-button.component.html',
  styleUrls: ['./cross-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class CrossButtonComponent {
  srcImageEnter: String = "icon/crossPressed.svg";
  srcImageLeave: String = "icon/cross.svg"
}