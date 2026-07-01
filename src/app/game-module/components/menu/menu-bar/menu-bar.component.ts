import { Component } from '@angular/core';
import { UserTabComponent } from '../user-tab/user-tab.component';
import { NavigationButtonComponent } from '../../../../main-appli-module/menu-module/components/navigation-button/navigation-button.component';
import { ChangeFormatPosterComponent } from '../../../../main-appli-module/menu-module/components/change-format-poster/change-format-poster.component';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [UserTabComponent, NavigationButtonComponent, ChangeFormatPosterComponent],
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})

export class MenuBarComponent {

}