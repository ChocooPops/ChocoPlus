import { Component, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CategoryPieChartComponent } from '../category-pie-chart/category-pie-chart.component';
import { WatchTimeStatsComponent } from '../watch-time-stats/watch-time-stats.component';
import { WatchingChartComponent } from '../watching-chart/watching-chart.component';
import { TopMediaComponent } from '../top-media/top-media.component';
import { UserParametersService } from '../../../service/user-parameters/user-parameters.service';
import { MenuType } from '../../../../menu-module/model/menu-type.enum';

@Component({
  selector: 'app-user-historic',
  standalone: true,
  imports: [CategoryPieChartComponent, WatchTimeStatsComponent, WatchingChartComponent, TopMediaComponent],
  templateUrl: './user-historic.component.html',
  styleUrl: './user-historic.component.css'
})
export class UserHistoricComponent {

  @Input() userId!: number;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  colPercent = 70;
  rowPercent = 35;

  private dragging: 'col' | 'row' | null = null;
  private activeDivider: HTMLElement | null = null;

  constructor(private readonly userParametersService: UserParametersService) {
    this.userParametersService.initAllClickedValue(MenuType.HISTORIC);
  }

  onDividerMouseDown(event: MouseEvent, type: 'col' | 'row'): void {
    event.preventDefault();
    this.dragging = type;
    this.activeDivider = event.target as HTMLElement;
    this.activeDivider.classList.add('active');
    document.body.style.cursor = type === 'col' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.dragging || !this.containerRef) return;

    const el = this.containerRef.nativeElement;
    const rect = el.getBoundingClientRect();
    const GAP = 25;
    const MIN_PX = 80;

    if (this.dragging === 'col') {
      const minX = rect.left + MIN_PX;
      const maxX = rect.right - MIN_PX - GAP;
      const clampedX = Math.min(maxX, Math.max(minX, event.clientX));

      this.colPercent = ((clampedX - rect.left + GAP / 2) / rect.width) * 100;

      const usablePct = ((clampedX - rect.left) / (rect.width - GAP)) * 100;
      el.style.gridTemplateColumns = `${usablePct}fr ${100 - usablePct}fr`;

    } else {
      const minY = rect.top + MIN_PX;
      const maxY = rect.bottom - MIN_PX - GAP;
      const clampedY = Math.min(maxY, Math.max(minY, event.clientY));

      this.rowPercent = ((clampedY - rect.top + GAP / 2) / rect.height) * 100;

      const usablePct = ((clampedY - rect.top) / (rect.height - GAP)) * 100;
      el.style.gridTemplateRows = `${usablePct}fr ${100 - usablePct}fr`;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (!this.dragging) return;
    this.dragging = null;
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