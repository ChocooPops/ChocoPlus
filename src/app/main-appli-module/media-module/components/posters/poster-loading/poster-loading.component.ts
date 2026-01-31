import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-poster-loading',
  standalone: true,
  imports: [],
  templateUrl: './poster-loading.component.html',
  styleUrl: '../../../../common-module/styles/animation.css'
})
export class PosterLoadingComponent {

  @Input() height !: number;
  @Input() width !: number;
  @Input() marginBottom !: number;

}
