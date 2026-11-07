import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NbResultsComponent } from '../nb-results/nb-results.component';

@Component({
  selector: 'app-title-grid',
  standalone: true,
  imports: [TranslatePipe, NbResultsComponent],
  templateUrl: './title-grid.component.html',
  styleUrl: './title-grid.component.css'
})
export class TitleGridComponent {

  @Input({ required: true }) title!: string;
  @Input({ required: true }) displayNbResults!: boolean;
  @Input() total: number | undefined = undefined;

}
