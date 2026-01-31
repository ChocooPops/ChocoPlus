import { Component } from '@angular/core';

@Component({
  selector: 'app-in-development-page',
  standalone: true,
  imports: [],
  templateUrl: './in-development-page.component.html',
  styleUrls: ['./in-development-page.component.css', '../../styles/loader.css']
})
export class InDevelopmentPageComponent {

  srcImage: string = 'icon/in-development.svg';

}
