import { Component } from '@angular/core';
import { UserTabComponent } from '../user-tab/user-tab.component';


@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [UserTabComponent],
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})

export class MenuBarComponent {

}