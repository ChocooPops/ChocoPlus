import { Component, Input } from '@angular/core';
import { LicenseModel } from '../../model/license.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';
import { Subscription } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { PaginationLicenseService } from '../../service/pagination-license/pagination-license.service';

@Component({
  selector: 'app-search-license',
  standalone: true,
  imports: [NgClass],
  templateUrl: './search-license.component.html',
  styleUrls: ['./search-license.component.css', '../../../common-module/styles/animation.css']
})
export class SearchLicenseComponent {

  @Input()
  licenseSearch !: LicenseModel;

  dimension !: DimensionModel;
  srcIcon: string | undefined;
  subscription: Subscription = new Subscription();

  constructor(private router: Router,
    private paginationLicenseService: PaginationLicenseService,
    private route: ActivatedRoute,
    private compressedPosterService: CompressedPosterService
  ) { }

  ngOnInit() {
    this.srcIcon = this.compressedPosterService.getIconForLicense(this.licenseSearch);
    this.subscription.add(
      this.paginationLicenseService.getResearchLicenseGeometricDimension().subscribe((geometricDimension: GeometricDimensionSelectionModel) => {
        this.dimension = {
          height: geometricDimension.heightPoster,
          width: geometricDimension.widthPoster
        }
      })
    )
  }

  onErrorImage(): void {
    this.srcIcon = undefined;
  }

  onClick() {
    this.router.navigate(['../license', this.licenseSearch.id], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
