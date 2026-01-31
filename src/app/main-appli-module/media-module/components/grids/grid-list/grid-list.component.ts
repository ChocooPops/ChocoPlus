import { Component, Input } from '@angular/core';
import { FormatPosterModel } from '../../../../common-module/models/format-poster.enum';
import { MediaModel } from '../../../models/media.interface';
import { VerticalGridComponent } from '../vertical-grid/vertical-grid.component';
import { HorizontalGridComponent } from '../horizontal-grid/horizontal-grid.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-grid-list',
  standalone: true,
  imports: [VerticalGridComponent, HorizontalGridComponent],
  templateUrl: './grid-list.component.html',
  styleUrl: './grid-list.component.css'
})
export class GridListComponent {

  @Input() mediaList: MediaModel[] | undefined = undefined;
  @Input() title: string = '';
  @Input() format: FormatPosterModel = FormatPosterModel.VERTICAL;
  subscription !: Subscription;
  FormatType = FormatPosterModel;

}
