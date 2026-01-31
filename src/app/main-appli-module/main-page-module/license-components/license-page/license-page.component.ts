import { Component, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { LicenseModel } from '../../../license-module/model/license.interface';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, switchMap, take } from 'rxjs';
import { MediaModel } from '../../../media-module/models/media.interface';
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
import { MediaPageComponent } from '../../../media-module/components/media-page/media-page/media-page.component';

@Component({
  selector: 'app-license-page',
  standalone: true,
  imports: [SelectionsListComponent, MediaPageComponent, NgClass, LicensePagesLoadingComponent],
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
  mediaSelected: MediaModel | undefined = undefined;
  private idLicense !: number;
  private subscription: Subscription = new Subscription();
  private changeNewPoster: boolean = false;

  constructor(private route: ActivatedRoute,
    private mediaSelectedService: MediaSelectedService,
    private licenseService: LicenseService,
    private renderer: Renderer2,
    private el: ElementRef,
    private imagePreloaderService: ImagePreloaderService,
    private formatPosterService: FormatPosterService,
    private compressedPosterService: CompressedPosterService,
    private menuTabService: MenuTabService
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
      const format: FormatPosterModel = this.formatPosterService.getFormatPosterLicenseValue();
      const img: string[] = this.imagePreloaderService.getPosterFromLicenseToLoad(data, format);
      this.abortController.abort();
      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.license = data;
        this.srcLogo = this.compressedPosterService.getLogoForLicense(data);
        this.srcBackground = this.compressedPosterService.getBackgroundForLicense(data);
        this.setBackgroundImage();
        this.changeNewPoster = true;
      })
    });

    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((media) => {
        this.mediaSelected = media;
      })
    )
  }

  private reloadWhenFormatPosterChange(): void {
    this.abortController.abort();
    this.licenseService.fetchLicenseById(this.idLicense).pipe(take(1)).subscribe((license: LicenseModel) => {
      if (license && license.selectionList) {
        const img: string[] = this.imagePreloaderService.getPosterFromSelectionToLoad(license.selectionList, this.format);
        this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
          if (this.license) {
            this.license.selectionList = license.selectionList;
          }
        })
      }
    })
  }

  ngOnDestroy(): void {
    this.mediaSelectedService.clearSelection();
    this.subscription.unsubscribe();
    this.abortController.abort();
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
