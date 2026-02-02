import { Component } from '@angular/core';
import { MenuTabModel } from '../../model/menu-tab.interface';
import { MenuTabComponent } from '../menu-tab/menu-tab.component';
import { NgClass } from '@angular/common';
import { ScrollEventService } from '../../../common-module/services/scroll-event/scroll-event.service';
import { fromEvent, Subscription } from 'rxjs';
import { UserTabComponent } from '../user-tab/user-tab.component';
import { ChangeFormatPosterComponent } from '../change-format-poster/change-format-poster.component';
import { MenuTabService } from '../../service/menu-tab/menu-tab.service';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [MenuTabComponent, NgClass, UserTabComponent, ChangeFormatPosterComponent],
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
    if (width <= 1130 && width > 1000) {
      this.menuPlus = this.menuTabService.getLastElements(2);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else if (width <= 1000 && width > 900) {
      this.menuPlus = this.menuTabService.getLastElements(3);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else if (width <= 900 && width > 800) {
      this.menuPlus = this.menuTabService.getLastElements(4);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else if (width <= 800 && width > 660) {
      this.menuPlus = this.menuTabService.getLastElements(5);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else if (width <= 660) {
      this.menuPlus = this.menuTabService.getLastElements(6);
      this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
    } else {
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