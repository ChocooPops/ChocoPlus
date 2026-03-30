import { Component } from '@angular/core';

@Component({
  selector: 'app-media-horizontal-page',
  standalone: true,
  imports: [],
  templateUrl: './media-horizontal-page.component.html',
  styleUrl: './media-horizontal-page.component.css'
})
export class MediaHorizontalPageComponent {

  
  onClickInformations(event: MouseEvent): void {
    event.stopPropagation();
  }

}
