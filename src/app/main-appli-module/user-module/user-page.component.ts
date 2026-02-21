import { Component, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserParamsComponent } from './components/user-params/user-params.component';
import { MenuTmpComponent } from '../menu-module/components/menu-tmp/menu-tmp.component';
import { MenuTabService } from '../menu-module/service/menu-tab/menu-tab.service';
import { LoadOpeningPageService } from '../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../launch-module/models/page.enum';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [RouterOutlet, UserParamsComponent, MenuTmpComponent],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.css'
})
export class UserPageComponent implements OnDestroy {

  @ViewChild('containerUser') containerUserRef!: ElementRef<HTMLDivElement>;

  dividerLeftPx = 380 + 50;

  private dragging = false;
  private activeDivider: HTMLElement | null = null;

  private readonly MIN_PX = 0;
  private readonly GAP = 35;
  private readonly PADDING = 50;

  constructor(
    private menuTabService: MenuTabService,
    private loadOpeningPageService: LoadOpeningPageService
  ) {
    this.menuTabService.setActivateTransition(false);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_USER);
  }

  onDividerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.dragging = true;
    this.activeDivider = event.target as HTMLElement;
    this.activeDivider.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.dragging || !this.containerUserRef) return;

    const el = this.containerUserRef.nativeElement;
    const rect = el.getBoundingClientRect();

    const usableWidth = rect.width - this.PADDING * 2 - this.GAP;

    const rawWidth = event.clientX - rect.left - this.PADDING;

    const clampedWidth = Math.min(
      usableWidth - this.MIN_PX,
      Math.max(this.MIN_PX, rawWidth)
    );

    el.style.gridTemplateColumns = `${clampedWidth}px 1fr`;
    this.dividerLeftPx = this.PADDING + clampedWidth + this.GAP / 2;
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.activeDivider) {
      this.activeDivider.classList.remove('active');
      this.activeDivider = null;
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  ngOnDestroy(): void {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
}