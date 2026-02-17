import { Component, Input } from '@angular/core';
import { CategoryPieChartComponent } from '../category-pie-chart/category-pie-chart.component';
import { WatchTimeStatsComponent } from '../watch-time-stats/watch-time-stats.component';
import { WatchingChartComponent } from '../watching-chart/watching-chart.component';
import { TopMediaComponent } from '../top-media/top-media.component';

@Component({
  selector: 'app-user-historic',
  standalone: true,
  imports: [CategoryPieChartComponent, WatchTimeStatsComponent, WatchingChartComponent, TopMediaComponent],
  templateUrl: './user-historic.component.html',
  styleUrl: './user-historic.component.css'
})
export class UserHistoricComponent {
  
  @Input() userId!: number;

}
