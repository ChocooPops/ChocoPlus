import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MenuTabModel } from '../../model/menu-tab.interface';
import { MenuTabComponent } from '../menu-tab/menu-tab.component';
import { NgClass } from '@angular/common';
import { ScrollEventService } from '../../../common-module/services/scroll-event/scroll-event.service';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { UserTabComponent } from '../user-tab/user-tab.component';
import { ChangeFormatPosterComponent } from '../change-format-poster/change-format-poster.component';
import { MenuTabService } from '../../service/menu-tab/menu-tab.service';
import { NavigationButtonComponent } from '../navigation-button/navigation-button.component';
import { DownloadMenuButtonComponent } from '../download-menu-button/download-menu-button.component';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [MenuTabComponent, NgClass, UserTabComponent, ChangeFormatPosterComponent, NavigationButtonComponent, DownloadMenuButtonComponent],
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})

export class MenuBarComponent implements AfterViewInit {
  menuTabs!: MenuTabModel[];

  plusTab!: MenuTabModel;
  menuPlus: MenuTabModel[] = [];

  isScrolled !: boolean;
  subscription: Subscription = new Subscription();
  activateTransition !: boolean;
  activateTransitionFromMediaPage !: boolean;
  class: string = 'not-visible-under-menu';

  private resizeSubscription!: Subscription;

  @ViewChild('menuRowRef') private menuRowRef!: ElementRef<HTMLElement>;
  @ViewChild('logoRef') private logoRef!: ElementRef<HTMLElement>;
  @ViewChild('otherTabRef') private otherTabRef!: ElementRef<HTMLElement>;
  @ViewChild('plusTabMeasureRef') private plusTabMeasureRef!: ElementRef<HTMLElement>;
  @ViewChildren('tabRef', { read: ElementRef }) private tabRefs!: QueryList<ElementRef<HTMLElement>>;

  private tabWidths: Map<number, number> = new Map();
  private plusTabWidth: number = 0;
  private tabsGap: number = 50;
  private readonly safetyMargin: number = 70;
  private widthsMeasured: boolean = false;

  constructor(
    private readonly menuTabService: MenuTabService,
    private readonly scrollEventService: ScrollEventService,
    private readonly cd: ChangeDetectorRef) {
    this.menuTabs = this.menuTabService.getAllMenuTab();
    this.plusTab = this.menuTabService.getMenuTab();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.scrollEventService.IfTopScrollIsAchievement().subscribe((isTopAchievement: boolean) => {
        this.isScrolled = isTopAchievement;
      })
    );

    this.subscription.add(
      this.menuTabService.getActivateTransition().subscribe((state: boolean) => {
        this.activateTransition = state;
      })
    );

    this.subscription.add(
      this.menuTabService.getActivateTransitionFromMediaPage().subscribe((state: boolean) => {
        this.activateTransitionFromMediaPage = state;
      })
    );

    this.resizeSubscription = fromEvent(window, 'resize').pipe(debounceTime(10)).subscribe(() => {
      this.checkWindowSize();
    });
  }

  ngAfterViewInit(): void {
    this.measureTabWidths();
    this.checkWindowSize();
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.resizeSubscription?.unsubscribe();
  }

  private measureTabWidths(): void {
    const computedGap = parseFloat(getComputedStyle(this.menuRowRef.nativeElement).columnGap);
    if (!isNaN(computedGap)) {
      this.tabsGap = computedGap;
    }

    const allTabs = this.menuTabService.getAllMenuTab();
    this.tabRefs.forEach((tabRef: ElementRef<HTMLElement>, index: number) => {
      const tab: MenuTabModel | undefined = allTabs[index];
      if (tab) {
        this.tabWidths.set(tab.id, tabRef.nativeElement.getBoundingClientRect().width);
      }
    });

    this.plusTabWidth = this.plusTabMeasureRef.nativeElement.getBoundingClientRect().width;
    this.widthsMeasured = true;
  }

  private checkWindowSize(): void {
    if (!this.widthsMeasured) return;

    const allTabs: MenuTabModel[] = this.menuTabService.getAllMenuTab();
    const availableWidth: number = this.getAvailableWidth();

    const totalTabsWidth: number = allTabs.reduce((sum: number, tab: MenuTabModel, index: number) =>
      sum + (this.tabWidths.get(tab.id) ?? 0) + (index > 0 ? this.tabsGap : 0), 0);

    if (totalTabsWidth <= availableWidth) {
      this.menuPlus = [];
      this.menuTabs = allTabs;
      return;
    }

    const budget: number = availableWidth - this.plusTabWidth - this.tabsGap;
    let usedWidth: number = 0;
    let visibleCount: number = 0;

    for (let i = 0; i < allTabs.length; i++) {
      const width: number = this.tabWidths.get(allTabs[i].id) ?? 0;
      const candidateWidth: number = usedWidth + (i > 0 ? this.tabsGap : 0) + width;
      if (candidateWidth > budget) break;
      usedWidth = candidateWidth;
      visibleCount++;
    }

    const hiddenCount: number = allTabs.length - visibleCount;
    this.menuPlus = this.menuTabService.getLastElements(hiddenCount);
    this.menuTabs = this.menuTabService.getTabsNotInPlus(this.menuPlus);
  }

  private getAvailableWidth(): number {
    const startX: number = this.logoRef.nativeElement.getBoundingClientRect().right;
    const endX: number = this.otherTabRef.nativeElement.getBoundingClientRect().left;
    return endX - startX - this.safetyMargin;
  }

  onMouseEnter(): void {
    this.class = 'visible-under-menu';
  }

  onMouseLeave(): void {
    this.class = 'not-visible-under-menu';
  }

}