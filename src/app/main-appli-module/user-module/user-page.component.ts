import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserParamsComponent } from './components/user-params/user-params.component';
import { MenuTmpComponent } from '../menu-module/components/menu-tmp/menu-tmp.component';
import { MenuTabService } from '../menu-module/service/menu-tab/menu-tab.service';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [RouterOutlet, UserParamsComponent, MenuTmpComponent],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.css'
})
export class UserPageComponent {

  constructor(private menuTabService: MenuTabService) {
    this.menuTabService.setActivateTransition(false);
  }

}
