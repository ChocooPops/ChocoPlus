import { Component } from '@angular/core';
import { UserTabComponent } from '../user-tab/user-tab.component';
import { NavigationButtonComponent } from '../../../main-appli-module/menu-module/components/navigation-button/navigation-button.component';
import { ChangeFormatPosterComponent } from '../../../main-appli-module/menu-module/components/change-format-poster/change-format-poster.component';
import { MenuTabComponent } from '../../../main-appli-module/menu-module/components/menu-tab/menu-tab.component';
import { MenuTabService } from '../../../main-appli-module/menu-module/service/menu-tab/menu-tab.service';
import { MenuTabModel } from '../../../main-appli-module/menu-module/model/menu-tab.interface';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [UserTabComponent, NavigationButtonComponent, ChangeFormatPosterComponent, MenuTabComponent, NgClass],
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})

export class MenuBarComponent {

  menuTabs: MenuTabModel[];
  isTransparent!: boolean;
  private subscription: Subscription = new Subscription();
  
  constructor(private readonly menuTabService: MenuTabService) {
    this.menuTabs = this.menuTabService.getAllOfflineMenuTab();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.menuTabService.getActivateTransition().subscribe((state: boolean) => {
        this.isTransparent = state;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}