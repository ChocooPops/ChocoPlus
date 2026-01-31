import { Component } from '@angular/core';
import { GraphComponent } from '../graph/graph.component';

@Component({
  selector: 'app-view-data',
  standalone: true,
  imports: [GraphComponent],
  templateUrl: './view-data.component.html',
  styleUrl: './view-data.component.css'
})
export class ViewDataComponent {

  loadData: boolean = false;

  onClick(): void {
    this.loadData = true;
  }

}
