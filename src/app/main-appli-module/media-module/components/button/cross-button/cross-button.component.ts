import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cross-button',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './cross-button.component.html',
  styleUrls: ['./cross-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class CrossButtonComponent {
  srcImageEnter: String = "icon/crossPressed.svg";
  srcImageLeave: String = "icon/cross.svg"
}