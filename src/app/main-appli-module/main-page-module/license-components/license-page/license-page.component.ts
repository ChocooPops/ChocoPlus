import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { catchError, map, of, Subscription, switchMap, take, tap } from 'rxjs';
import { NgClass } from '@angular/common';
import { LicenseModel } from '../../../license-module/model/license.interface';
import { LicensePagesLoadingComponent } from '../license-page-loading/license-page-loading.component';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { SelectionsListComponent } from '../../../media-module/components/selections/selections-list/selections-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { LicenseService } from '../../../license-module/service/license/licence.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
@Component({
  selector: 'app-license-page',
  standalone: true,
  imports: [SelectionsListComponent, NgClass, LicensePagesLoadingComponent],
  templateUrl: './license-page.component.html',
  styleUrls: ['./license-page.component.css', '../../../common-module/styles/animation.css']
})

export class LicensePageComponent {
  
  private abortController = new AbortController();
  private subscription: Subscription = new Subscription();

  license: LicenseModel | undefined = undefined;
  format !: FormatPosterModel;
  srcLogo !: string | undefined;
  srcBackground !: string | undefined;
  backgroundImage: string | null = null;

  constructor(private readonly route: ActivatedRoute,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly licenseService: LicenseService,
    private readonly imagePreloaderService: ImagePreloaderService,
    private readonly formatPosterService: FormatPosterService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly menuTabService: MenuTabService,
    private readonly loadOpeningPageService: LoadOpeningPageService
  ) {
    this.menuTabService.setActivateTransition(true);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterLicense().subscribe((format: FormatPosterModel) => {
        this.format = format;
      })
    )

    this.subscription.add(
      this.route.paramMap.pipe(
        map((params: ParamMap) => Number(params.get('id'))),
        switchMap((id: number) => this.licenseService.fetchLicenseById(id).pipe(
          take(1),
          map((data: LicenseModel) => ({ id, data })),
          catchError(() => of({ id, data: undefined }))
        ))
      ).subscribe(({ id, data }) => {
        if (data) {
          this.onLicenseLoaded(id, data);
        }
      })
    );
  }

  private onLicenseLoaded(id: number, data: LicenseModel): void {
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_LICENSE);
    this.loadOpeningPageService.setLastLicenseIdVisited(id);

    const img: string[] = []
    const srcLogo: string | undefined = this.compressedPosterService.getLogoForLicense(data);
    const srcBackground: string | undefined = this.compressedPosterService.getBackgroundForLicense(data);
    if (srcLogo) img.push(srcLogo);
    if (srcBackground) img.push(srcBackground);

    this.imagePreloaderService.preloadImages(img, this.abortController.signal)
      .finally(() => {
        if (this.abortController.signal.aborted) return;
        this.license = data;
        this.srcLogo = srcLogo;
        this.backgroundImage = srcBackground ? `url("${srcBackground}")` : null;
      });
  }

  ngOnDestroy(): void {
    this.mediaSelectedService.clearSelection();
    this.subscription.unsubscribe();
    this.abortController.abort();
  }

  onErrorLogo(): void {
    this.srcLogo = undefined
  }

}
