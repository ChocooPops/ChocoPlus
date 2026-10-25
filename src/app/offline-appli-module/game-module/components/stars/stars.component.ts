import { Component } from '@angular/core';

export const STARS_SRC: string = 'game/stars.gif';

@Component({
  selector: 'app-stars',
  standalone: true,
  imports: [],
  templateUrl: './stars.component.html',
  styleUrl: './stars.component.css'
})
export class StarsComponent {

  srcImageStars: string = STARS_SRC;

}
