import { Component } from '@angular/core';
import { MenuTmpComponent } from '../../../menu-module/components/menu-tmp/menu-tmp.component';
import { MediaModel } from '../../../media-module/models/media.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, Subscription, map, of } from 'rxjs';
//import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { GridListComponent } from '../../../media-module/components/grids/grid-list/grid-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { SearchLicenseListComponent } from '../../../license-module/components/search-license-list/search-license-list.component';
import { MediaService } from '../../../media-module/services/media/media.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
import { TranslatePipe } from '@ngx-translate/core';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [TranslatePipe, GridListComponent, SearchLicenseListComponent, MenuTmpComponent, ReactiveFormsModule],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent {

  placeHolder = 'SEARCH_PAGE.PLACEHOLDER_RESEARCH_MOVIE_SERIES';
  title = 'SEARCH_PAGE.RESULT';

  //private abortController = new AbortController();
  format!: FormatPosterModel;
  srcImageResearch: string = 'icon/research.svg';
  mediaWanted: MediaModel[] | undefined = undefined;
  mediaWantedTmp: MediaModel[] = [];
  displayMediaWanted!: boolean;
  timerResearch: any | null;
  refresh: number = 300;

  formGroup!: FormGroup;
  private loadNewFormat: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private readonly fb: FormBuilder,
    private readonly mediaService: MediaService,
    //private readonly imagePreloaderService: ImagePreloaderService,
    private readonly formatPosterService: FormatPosterService,
    private readonly menuTabService: MenuTabService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly loadOpeningPageService: LoadOpeningPageService,
    private readonly mediaSelectedService: MediaSelectedService
  ) {
    this.menuTabService.setActivateTransition(false);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_RESEARCH);
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
          this.mediaWanted = data;
          this.mediaWantedTmp = data;
          this.loadNewFormat = true;
          // const format = this.formatPosterService.getFormatPosterResearchValue();
          // const img = this.imagePreloaderService.getPosterFromMediaListToLoad(data, format);
          // this.imagePreloaderService.preloadImages(img, this.abortController.signal)
          //   .finally(() => {
          //     this.mediaWanted = data;
          //     this.mediaWantedTmp = data;
          //     this.loadNewFormat = true;
          //   });
        }
      })
    );
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
    //this.abortController.abort();
    this.mediaSelectedService.clearSelection();
  }

  private preloadNewFormat(): void {
    // const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(this.mediaWantedTmp, this.format);
    // this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
    //   //this.movieWanted = this.movieWantedTmp;
    // })
  }

}
