import { Component } from '@angular/core';
import { CategoryPieChartComponent } from '../category-pie-chart/category-pie-chart.component';

@Component({
  selector: 'app-user-historic',
  standalone: true,
  imports: [CategoryPieChartComponent],
  templateUrl: './user-historic.component.html',
  styleUrl: './user-historic.component.css'
})
export class UserHistoricComponent {

}
