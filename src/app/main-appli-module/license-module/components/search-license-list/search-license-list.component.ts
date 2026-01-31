import { Component } from '@angular/core';
import { LicenseModel } from '../../model/license.interface';
import { SearchLicenseComponent } from '../search-license/search-license.component';
import { Subscription, take } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { LicenseService } from '../../service/license/licence.service';
import { PaginationLicenseService } from '../../service/pagination-license/pagination-license.service';
import { SearchLicenseLoadingComponent } from '../../../main-page-module/search-components/search-license-loading/search-license-loading.component';

@Component({
  selector: 'app-search-license-list',
  standalone: true,
  imports: [SearchLicenseComponent, SearchLicenseLoadingComponent],
  templateUrl: './search-license-list.component.html',
  styleUrl: './search-license-list.component.css'
})
export class SearchLicenseListComponent {

  private abortController = new AbortController();
  licenseSearchList: LicenseModel[] | undefined = undefined;
  licenseLoadingList: number[] = [];
  gap !: number;
  marginLeft !: number;
  marginBottom !: number;
  dimension !: DimensionModel;
  private subscrition: Subscription = new Subscription();

  constructor(private licenseService: LicenseService,
    private paginationLicenseService: PaginationLicenseService,
    private imagePreloaderService: ImagePreloaderService
  ) { }

  ngOnInit(): void {
    this.subscrition.add(
      this.licenseService.fetchAllLicenseResearch().pipe(take(1)).subscribe((data: LicenseModel[] | undefined) => {
        if (data) {
          const img: string[] = this.imagePreloaderService.getAllIconsFromLicense(data);
          this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
            this.licenseSearchList = data;
          })
        }
      })
    )
    this.subscrition.add(
      this.paginationLicenseService.getResearchLicenseGeometricDimension().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.gap = dimension.gapBetweenPoster;
        this.marginLeft = dimension.marginLeft;
        this.marginBottom = dimension.heightPoster * 0.5;
        this.dimension = {
          height: dimension.heightPoster,
          width: dimension.widthPoster
        }
      })
    )
    for (let i: number = 0; i < 16; i++) {
      this.licenseLoadingList.push(i);
    }
  }

  ngOnDestroy(): void {
    this.subscrition.unsubscribe();
    this.abortController.abort();
  }

}
