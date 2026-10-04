import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, of, Subscription, switchMap } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuTmpComponent } from '../../../menu-module/components/menu-tmp/menu-tmp.component';
import { MediaModel } from '../../../media-module/models/media.interface';
import { GridListComponent } from '../../../media-module/components/grids/grid-list/grid-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { SearchLicenseListComponent } from '../../../license-module/components/search-license-list/search-license-list.component';
import { MediaService } from '../../../media-module/services/media/media.service';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [TranslatePipe, GridListComponent, SearchLicenseListComponent, MenuTmpComponent, ReactiveFormsModule],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent {

  @ViewChild('inputSearch') inputSearch!: ElementRef<HTMLInputElement>;
  private readonly subscription: Subscription = new Subscription();
  private readonly refresh: number = 300;

  public readonly placeHolder = 'SEARCH_PAGE.PLACEHOLDER_RESEARCH_MOVIE_SERIES';
  public readonly title = 'SEARCH_PAGE.RESULT';

  public readonly formGroup = new FormGroup({
    inputValue: new FormControl<string>('')
  });

  format!: FormatPosterModel;
  srcImageResearch: string = 'icon/research.svg';
  mediaWanted: MediaModel[] | undefined = undefined;
  displayMediaWanted: boolean = false;

  private get inputControl(): FormControl<string | null> {
    return this.formGroup.controls.inputValue;
  }

  constructor(private readonly mediaService: MediaService,
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

  ngOnInit(): void {
    const initialKeyword: string = this.route.snapshot.queryParamMap.get('keyword') ?? '';
    this.inputControl.setValue(initialKeyword, { emitEvent: false });

    this.subscription.add(
      this.inputControl.valueChanges.pipe(
        map((value: string | null) => (value ?? '').trim()),
        debounceTime(this.refresh),
        distinctUntilChanged()
      ).subscribe((keyword: string) => this.addActionParam(keyword))
    );

    this.subscription.add(
      this.route.queryParamMap.pipe(
        map(params => (params.get('keyword') ?? '').trim()),
        distinctUntilChanged(),
        switchMap((keyword: string) => {
          this.syncInput(keyword);
          this.displayMediaWanted = keyword !== '';
          this.mediaWanted = undefined;

          if (!keyword) return of(null);
          return this.mediaService.fetchResearchMediaByKeyword(keyword).pipe(
            catchError(() => of([] as MediaModel[]))
          );
        })
      ).subscribe((data: MediaModel[] | null) => {
        if (data) {
          this.mediaWanted = data;
        }
      })
    );

    this.subscription.add(
      this.formatPosterService.fetchFormatPosterResearch().subscribe((format: FormatPosterModel) => {
        this.format = format;
      })
    );
  }

  ngAfterViewInit(): void {
    this.inputSearch.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.mediaSelectedService.clearSelection();
  }

  private addActionParam(keyword: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { keyword: keyword || null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private syncInput(keyword: string): void {
    if ((this.inputControl.value ?? '').trim() !== keyword) {
      this.inputControl.setValue(keyword, { emitEvent: false });
    }
  }

}