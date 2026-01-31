import { Component, Input } from '@angular/core';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';

@Component({
  selector: 'app-search-license-loading',
  standalone: true,
  imports: [],
  templateUrl: './search-license-loading.component.html',
  styleUrls: ['./search-license-loading.component.css', '../../../common-module/styles/animation.css']
})
export class SearchLicenseLoadingComponent {

  @Input()
  dimension: DimensionModel = {
    height: 0,
    width: 0
  }

}
