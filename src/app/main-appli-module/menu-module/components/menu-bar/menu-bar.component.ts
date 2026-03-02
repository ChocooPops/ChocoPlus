import { Component } from '@angular/core';
import { MenuTabModel } from '../../model/menu-tab.interface';
import { MenuTabComponent } from '../menu-tab/menu-tab.component';
import { NgClass } from '@angular/common';
import { ScrollEventService } from '../../../common-module/services/scroll-event/scroll-event.service';
import { fromEvent, Subscription } from 'rxjs';
import { UserTabComponent } from '../user-tab/user-tab.component';
import { ChangeFormatPosterComponent } from '../change-format-poster/change-format-poster.component';
import { MenuTabService } from '../../service/menu-tab/menu-tab.service';
import { NavigationButtonComponent } from '../navigation-button/navigation-button.component';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [MenuTabComponent, NgClass, UserTabComponent, ChangeFormatPosterComponent, NavigationButtonComponent],
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})

export class MenuBarComponent {
  menuTabs!: MenuTabModel[];

  plusTab!: MenuTabModel;
  menuPlus: MenuTabModel[] = [];

  isScrolled !: boolean;
  subscription: Subscription = new Subscription();
  activateTransition !: boolean;
  activateTransitionFromMediaPage !: boolean;
  class: string = 'not-visible-under-menu';

  private resizeSubscription!: Subscription;

  constructor(
    private menuTabService: MenuTabService,
    private scrollEventService: ScrollEventService) {
    this.menuTabs = this.menuTabService.getAllMenuTab();
    this.plusTab = this.menuTabService.getMenuTab();
  }

  ngOnInit(): void {
    this.checkWindowSize();
    this.subscription.add(
      this.scrollEventService.IfTopScrollIsAchievement().subscribe((isTopAchievement: boolean) => {
        this.isScrolled = isTopAchievement;
      })
    )

    this.subscription.add(
      this.menuTabService.getActivateTransition().subscribe((state: boolean) => {
        this.activateTransition = state;
      })
    )

    this.subscription.add(
      this.menuTabService.getActivateTransitionFromMediaPage().subscribe((state: boolean) => {
        this.activateTransitionFromMediaPage = state;
      })
    )

    this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      this.checkWindowSize();
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private checkWindowSize(): void {
    const width: number = window.innerWidth;
    if (width <= 1340 && width > 1225) {
      this.menuPlus = this.menuTabService.getLastElements(2);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else if (width <= 1225 && width > 1080) {
      this.menuPlus = this.menuTabService.getLastElements(3);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else if (width <= 1080 && width > 980) {
      this.menuPlus = this.menuTabService.getLastElements(4);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else if (width <= 980 && width > 890) {
      this.menuPlus = this.menuTabService.getLastElements(5);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else if (width <= 890 && width > 750) {
      this.menuPlus = this.menuTabService.getLastElements(6);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else if (width <= 750) {
      this.menuPlus = this.menuTabService.getLastElements(7);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    }else {
      this.menuPlus = [];
      this.menuTabs = this.menuTabService.getAllMenuTab();
    }
  }

  onMouseEnter(): void {
    this.class = 'visible-under-menu';
  }

  onMouseLeave(): void {
    this.class = 'not-visible-under-menu';
  }

}