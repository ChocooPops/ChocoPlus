import { Component, Input } from '@angular/core';
import { LicenseModel } from '../../model/license.interface';
import { DisplayOrderService } from '../../../media-module/services/display-order/display-order.service';
import { NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { PaginationLicenseService } from '../../service/pagination-license/pagination-license.service';

@Component({
  selector: 'app-home-license',
  standalone: true,
  imports: [NgClass],
  templateUrl: './home-license.component.html',
  styleUrls: ['./home-license.component.css', '../../../common-module/styles/animation.css']
})
export class HomeLicenseComponent {

  @Input()
  licenceHome !: LicenseModel;
  srcIcon !: String | undefined;
  zIndex !: number;
  subscription: Subscription = new Subscription();
  dimension !: DimensionModel;

  constructor(private displayOrderService: DisplayOrderService,
    private router: Router,
    private paginationLicenseService: PaginationLicenseService,
    private route: ActivatedRoute,
    private compressedPosterService: CompressedPosterService
  ) {
    this.zIndex = this.displayOrderService.getInitOrder();
  }

  onMouseEnter(): void {
    this.zIndex = this.displayOrderService.getOrderDisplay();
  }

  ngOnInit() {
    this.srcIcon = this.compressedPosterService.getIconForLicense(this.licenceHome);
    this.subscription.add(
      this.paginationLicenseService.getHomeLicenseGeometricDimension().subscribe((geoDimension: GeometricDimensionSelectionModel) => {
        this.dimension = {
          height: geoDimension.heightPoster,
          width: geoDimension.widthPoster
        }
      })
    )
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onErrorImage(): void {
    this.srcIcon = undefined;
  }

  onClick(): void {
    this.router.navigate(['../license', this.licenceHome.id], { relativeTo: this.route });
  }

}
