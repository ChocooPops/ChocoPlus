import { Component } from '@angular/core';
import { ParameterAppliComponent } from '../../main-appli-module/user-module/components/user-parameters-app/parameter-appli/parameter-appli.component';
import { MenuTmpComponent } from '../../main-appli-module/menu-module/components/menu-tmp/menu-tmp.component';
import { MenuTabService } from '../../main-appli-module/menu-module/service/menu-tab/menu-tab.service';

@Component({
  selector: 'app-parameter-appli-offline',
  standalone: true,
  imports: [ParameterAppliComponent, MenuTmpComponent],
  templateUrl: './parameter-appli-offline.component.html',
  styleUrl: './parameter-appli-offline.component.css'
})
export class ParameterAppliOfflineComponent {

  constructor(private readonly menuTabService: MenuTabService) {
    this.menuTabService.setActivateTransition(false)
  }

}
