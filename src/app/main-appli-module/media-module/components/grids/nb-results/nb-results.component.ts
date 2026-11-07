import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-nb-results',
  standalone: true,
  imports: [TranslatePipe, LowerCasePipe],
  templateUrl: './nb-results.component.html',
  styleUrls: ['./nb-results.component.css', '../../../../common-module/styles/animation.css']
})
export class NbResultsComponent {

  @Input() total: number | undefined = undefined;

}
