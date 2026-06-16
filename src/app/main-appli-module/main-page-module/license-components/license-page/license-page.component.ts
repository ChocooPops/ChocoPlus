import { Component, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { LicenseModel } from '../../../license-module/model/license.interface';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, switchMap, take } from 'rxjs';
import { NgClass } from '@angular/common';
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

  @ViewChild('containerLicense') containerLisence !: ElementRef<HTMLDivElement>;
  
  private abortController = new AbortController();

  license: LicenseModel | undefined = undefined;
  srcLogo !: string | undefined;
  srcBackground !: string | undefined;
  format !: FormatPosterModel;
  private idLicense !: number;
  private subscription: Subscription = new Subscription();
  private changeNewPoster: boolean = false;

  constructor(private readonly route: ActivatedRoute,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly licenseService: LicenseService,
    private readonly renderer: Renderer2,
    private readonly el: ElementRef,
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
        if (this.changeNewPoster && this.license) {
          //this.license.movieSelectionList = undefined;
          this.reloadWhenFormatPosterChange();
        }
      })
    )

    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const id = Number(params.get('id'));
        this.idLicense = id;
        return this.licenseService.fetchLicenseById(id);
      })
    ).pipe(take(1)).subscribe((data: LicenseModel) => {
      this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_LICENSE);
      this.loadOpeningPageService.setLastLicenseIdVisited(this.idLicense);
      const img: string[] = [];
      const srcLogoTmp: string | undefined = this.compressedPosterService.getLogoForLicense(data);
      const srcBackground: string | undefined = this.compressedPosterService.getBackgroundForLicense(data);
      if (srcLogoTmp) img.push(srcLogoTmp);
      if (srcBackground) img.push(srcBackground);
      this.abortController.abort();

      // const format: FormatPosterModel = this.formatPosterService.getFormatPosterLicenseValue();
      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.license = data;
        this.srcLogo = this.compressedPosterService.getLogoForLicense(data);
        this.srcBackground = this.compressedPosterService.getBackgroundForLicense(data);
        this.setBackgroundImage();
        this.changeNewPoster = true;
      })
    });
  }

  private reloadWhenFormatPosterChange(): void {
    //this.abortController.abort();
    this.licenseService.fetchLicenseById(this.idLicense).pipe(take(1)).subscribe((license: LicenseModel) => {
      if (license && license.selectionList) {
        if (this.license) {
          this.license.selectionList = license.selectionList;
        }
        // const img: string[] = this.imagePreloaderService.getPosterFromSelectionToLoad(license.selectionList, this.format);
        // this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        //   if (this.license) {
        //     this.license.selectionList = license.selectionList;
        //   }
        // })
      }
    })
  }

  ngOnDestroy(): void {
    this.mediaSelectedService.clearSelection();
    this.subscription.unsubscribe();
    //this.abortController.abort();
  }

  setBackgroundImage(): void {
    if (this.license && this.srcBackground) {
      const container = this.el.nativeElement.querySelector('.container-license');
      if (container) {
        let path = `${this.srcBackground}`
        this.renderer.setStyle(
          container,
          'background-image',
          `url("${path}")`
        );
      }
    }
  }

  onErrorLogo(): void {
    this.srcLogo = undefined
  }

}
