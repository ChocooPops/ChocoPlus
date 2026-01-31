import { Component } from '@angular/core';
import { MenuTmpComponent } from '../../../menu-module/components/menu-tmp/menu-tmp.component';
import { MediaModel } from '../../../media-module/models/media.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, Subscription, map, of } from 'rxjs';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { GridListComponent } from '../../../media-module/components/grids/grid-list/grid-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { SearchLicenseListComponent } from '../../../license-module/components/search-license-list/search-license-list.component';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { MediaPageComponent } from '../../../media-module/components/media-page/media-page/media-page.component';
import { MediaService } from '../../../media-module/services/media/media.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [MediaPageComponent, GridListComponent, SearchLicenseListComponent, MenuTmpComponent, ReactiveFormsModule],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent {

  private abortController = new AbortController();
  title: string = 'Résultat';
  format!: FormatPosterModel;
  srcImageResearch: string = 'icon/research.svg';
  mediaWanted: MediaModel[] | undefined = undefined;
  mediaWantedTmp: MediaModel[] = [];
  displayMediaWanted!: boolean;
  timerResearch: any | null;
  refresh: number = 300;

  formGroup!: FormGroup;
  mediaSelected: MediaModel | undefined = undefined;
  private loadNewFormat: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder,
    private mediaService: MediaService,
    private mediaSelectedService: MediaSelectedService,
    private imagePreloaderService: ImagePreloaderService,
    private formatPosterService: FormatPosterService,
    private menuTabService: MenuTabService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.menuTabService.setActivateTransition(false);
  }

  private addActionParam(keyword: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { keyword },
      queryParamsHandling: 'merge'
    });
  }

  private stopTimerResearch(): void {
    if (this.timerResearch) {
      clearInterval(this.timerResearch)
    }
  }

  private setPageAccordingToKeyword(): void {
    const keyword = this.route.snapshot.queryParamMap.get('keyword') ?? '';
    if (keyword.trim() !== '') {
      this.displayMediaWanted = true;
      this.formGroup.get('inputValue')?.setValue(keyword);
    } else {
      this.displayMediaWanted = false;
    }
  }

  private loadForm(): void {
    this.formGroup = this.fb.group({
      inputValue: ['']
    });
    this.formGroup.get('inputValue')?.valueChanges.subscribe(value => {
      this.stopTimerResearch();
      this.mediaWanted = undefined;
      this.mediaWantedTmp = [];
      if (value.trim() === "") {
        this.displayMediaWanted = false;
      }
      this.addActionParam(value)
    });
  }

  ngOnInit(): void {
    this.loadForm();
    this.setPageAccordingToKeyword();

    this.subscription.add(
      this.route.queryParamMap.pipe(
        map(params => params.get('keyword') ?? ''),
        debounceTime(this.refresh),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (keyword.trim() !== "") {
            this.displayMediaWanted = true;
            this.mediaWanted = undefined;
            this.mediaWantedTmp = [];
            return this.mediaService.fetchResearchMediaByKeyword(keyword);
          }
          return of(null);
        })
      ).subscribe(data => {
        if (data) {
          const format = this.formatPosterService.getFormatPosterResearchValue();
          const img = this.imagePreloaderService.getPosterFromMediaListToLoad(data, format);
          this.imagePreloaderService.preloadImages(img, this.abortController.signal)
            .finally(() => {
              this.mediaWanted = data;
              this.mediaWantedTmp = data;
              this.loadNewFormat = true;
            });
        }
      })
    );

    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((movie: MediaModel | undefined) => {
        this.mediaSelected = movie;
      })
    )
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterResearch().subscribe((format: FormatPosterModel) => {
        this.format = format;
        if (!this.loadNewFormat) {
          //this.movieWanted = undefined
          this.preloadNewFormat();
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.abortController.abort();
  }

  private preloadNewFormat(): void {
    const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(this.mediaWantedTmp, this.format);
    this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
      //this.movieWanted = this.movieWantedTmp;
    })
  }

}
