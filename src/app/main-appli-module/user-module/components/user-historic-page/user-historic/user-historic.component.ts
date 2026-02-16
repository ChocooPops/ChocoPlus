import { Component } from '@angular/core';
import { CategoryPieChartComponent } from '../category-pie-chart/category-pie-chart.component';
import { WatchTimeStatsComponent } from '../watch-time-stats/watch-time-stats.component';

@Component({
  selector: 'app-user-historic',
  standalone: true,
  imports: [CategoryPieChartComponent, WatchTimeStatsComponent],
  templateUrl: './user-historic.component.html',
  styleUrl: './user-historic.component.css'
})
export class UserHistoricComponent {

}
