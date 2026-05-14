import { Component, ElementRef, Input, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { MediaLibrary } from '../../../models/library/media-library.interface';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageReturnedModel } from '../../../../../common-module/models/message-returned.interface';
import { LibraryService } from '../../../services/library/library.service';
import { NgClass } from '@angular/common';
import { UnauthorizedError } from '../../abstract-components/unauthorized-error-abstract.directive';
import { EditionParametersService } from '../../../services/edition-parameters/edition-parameters.service';
import { MenuType } from '../../../../menu-module/model/menu-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { PopupComponent } from '../../popup/popup.component';

type SeriesTypeFilter = 'ALL' | 'SERIES' | 'SEASON' | 'EPISODE';

interface FeedbackState {
  message: string;
  state: boolean;
}

interface PagedItem {
  mediaLibrary: MediaLibrary;
  originalIndex: number;
}

@Component({
  selector: 'app-series-library-tab',
  standalone: true,
  imports: [FormsModule, TranslatePipe, NgClass, PopupComponent],
  templateUrl: './series-library-tab.component.html',
  styleUrl: './series-library-tab.component.css'
})
export class SeriesLibraryTabComponent extends UnauthorizedError {

  private readonly messageTmdb = 'EDITION.LIBRARY.MESSAGE_TMDB';
  protected override menuType: MenuType = MenuType.LIBRARY;

  @Input() mediaLibraries: MediaLibrary[] = [];
  @Output() onMediaLibrary = new EventEmitter<void>();
  @ViewChild('selectSize') selectSize!: ElementRef;

  feedbackStates: (FeedbackState | null)[] = [];
  loadingStates: boolean[] = [];
  private feedbackTimers: ReturnType<typeof setTimeout>[] = [];
  private seriesLibrarySelected: MediaLibrary | null = null;
  private previousValue: number | null = null;


  srcIconSave: string = 'icon/save.svg';

  searchQuery: string = '';
  //filterMissingYear: boolean = false;
  filterMissingTmdb: boolean = false;

  filterType: SeriesTypeFilter = 'ALL';

  pageSize: number = 50;
  sizes: number[] = [25, 50, 100, 200, 500, 1000];
  displaySelectSize: boolean = false;

  currentPage: number = 0;

  private filteredItems: PagedItem[] = [];

  pagedItems: PagedItem[] = [];

  filteredCount: number = 0;

  totalPages: number = 0;

  visiblePages: number[] = [];

  private readonly MIN_COL_WIDTH = 40;
  private readonly FEEDBACK_DURATION_MS = 12000;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly libraryService: LibraryService,
    editionParametersService: EditionParametersService
  ) {
    super(editionParametersService)
  }

  ngOnChanges(): void {
    this.loadingStates = this.mediaLibraries.map(() => false);
    this.feedbackStates = this.mediaLibraries.map(() => null);
    this.feedbackTimers = this.mediaLibraries.map(() => undefined as any);
    this.applyFilters();
  }

  ngAfterViewInit(): void {
    this.initResizableColumns();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  openSelectSize(): void {
    this.displaySelectSize = !this.displaySelectSize;
  }

  onPageSizeChange(size: number): void {
    this.displaySelectSize = false;
    this.pageSize = size;
    this.currentPage = 0;
    this.updatePage();
  }

  toggleFilterYear(): void {
    //this.filterMissingYear = !this.filterMissingYear;
    this.filterMissingTmdb = false;
    this.onFilterChange();
  }

  toggleFilterTmdb(): void {
    this.filterMissingTmdb = !this.filterMissingTmdb;
    //this.filterMissingYear = false;
    this.onFilterChange();
  }

  setTypeFilter(type: SeriesTypeFilter): void {
    this.filterType = type;
    this.onFilterChange();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onFilterChange();
  }

  isYearInvalid(ml: MediaLibrary): boolean {
    if (ml.type !== 'SERIES') return false;
    return ml.year == null || Number(ml.year) <= 0;
  }

  isTmdbInvalid(ml: MediaLibrary): boolean {
    if (ml.type !== 'SERIES') return false;
    return ml.tmdbId == null || ml.tmdbId <= 0;
  }

  isRowWarning(ml: MediaLibrary): boolean {
    return this.isYearInvalid(ml) || this.isTmdbInvalid(ml);
  }

  getTypeBadgeClass(type: string | undefined): string {
    switch (type) {
      case 'SERIES':  return 'ct-badge--series';
      case 'SEASON':  return 'ct-badge--season';
      case 'EPISODE': return 'ct-badge--episode';
      default:        return '';
    }
  }

  private applyFilters(): void {
    const q = this.searchQuery.trim().toLowerCase();

    this.filteredItems = this.mediaLibraries
      .map((ml, originalIndex) => ({ mediaLibrary: ml, originalIndex }))
      .filter(({ mediaLibrary: ml }) => {
        if (q && !ml.titleFormated?.toLowerCase().includes(q)) return false;
        if (this.filterType !== 'ALL' && ml.type !== this.filterType) return false;
        //if (this.filterMissingYear && !this.isYearInvalid(ml)) return false;
        if (this.filterMissingTmdb && !this.isTmdbInvalid(ml)) return false;
        return true;
      });

    this.filteredCount = this.filteredItems.length;
    this.totalPages = Math.max(1, Math.ceil(this.filteredCount / this.pageSize));

    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }

    this.updatePage();
  }

  private updatePage(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));

    const start = this.currentPage * this.pageSize;
    this.pagedItems = this.filteredItems.slice(start, start + this.pageSize);

    this.buildVisiblePages();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  private buildVisiblePages(): void {
    const total = this.totalPages;
    const cur = this.currentPage;
    const pages: number[] = [];

    if (total <= 9) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      const set = new Set<number>();
      set.add(0);
      set.add(total - 1);
      for (let i = Math.max(0, cur - 2); i <= Math.min(total - 1, cur + 2); i++) set.add(i);

      const sorted = Array.from(set).sort((a, b) => a - b);
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push(-1);
        pages.push(sorted[i]);
      }
    }

    this.visiblePages = pages;
  }

  private initResizableColumns(): void {
    const handles = this.elementRef.nativeElement.querySelectorAll('.ct-resize-handle');
    handles.forEach((handle: HTMLElement) => {
      let startX = 0;
      let startWidth = 0;
      let th: HTMLElement | null = null;

      const onMouseMove = (e: MouseEvent) => {
        if (!th) return;
        const newWidth = Math.max(this.MIN_COL_WIDTH, startWidth + (e.clientX - startX));
        th.style.width = newWidth + 'px';
      };

      const onMouseUp = () => {
        handle.classList.remove('is-resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        th = null;
      };

      handle.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        th = handle.closest('th') as HTMLElement;
        startX = e.clientX;
        startWidth = th.offsetWidth;
        handle.classList.add('is-resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  }

  onFocus(seriesLibrary: MediaLibrary): void {
    this.previousValue = seriesLibrary.tmdbId;
  }

  onBlur(seriesLibrary: MediaLibrary): void {
    const newValue = seriesLibrary.tmdbId;
    if (this.previousValue !== newValue) {
      this.seriesLibrarySelected = seriesLibrary;
      this.popup.setMessage(this.messageTmdb, undefined);
      this.popup.setDisplayPopup(true);
      this.popup.setDisplayButton(true);
    }
  }

  rollback(): void {
    if (this.previousValue) {
      const index: number = this.mediaLibraries.findIndex((item) => item.id === this.seriesLibrarySelected?.id);
      if (index >= 0) {
        this.mediaLibraries[index].tmdbId = this.previousValue;
      }
    }
    this.previousValue = null;
    this.seriesLibrarySelected = null;
  }
  
  modifyTmdbIdFromMediaLibrary(): void {
    if (!this.seriesLibrarySelected) return;
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.libraryService.modifyTmdbIdFromMediaLibrary(this.seriesLibrarySelected).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
        if (data.state) {
          if (data.state && Array.isArray(data.other) && data.other.length > 0) {
          const updatedIds = new Set<string>(data.other);
          this.mediaLibraries = this.mediaLibraries.map((ml) =>
              updatedIds.has(ml.id) ? { ...ml, tmdbId: this.seriesLibrarySelected?.tmdbId ?? 0} : ml
            );
            this.applyFilters();
          }
          this.previousValue = null;
        }
        this.rollback();
      },
      error: (error: HttpErrorResponse) => {
        this.rollback();
        this.displayPopupOnError(error, 2);
      }
    });
  }

  saveVersion(mediaLibrary: MediaLibrary, index: number): void {
    if (mediaLibrary.type !== 'SERIES') return;
    if (this.loadingStates[index]) return;
  
    this.loadingStates[index] = true;
    this.feedbackStates[index] = null;
    clearTimeout(this.feedbackTimers[index]);
  
    this.libraryService.reloadMediaLibraryMetedata(mediaLibrary.id).subscribe({
      next: (result: MessageReturnedModel) => {
        this.loadingStates[index] = false;
        this.feedbackStates[index] = { message: result.message, state: result.state };
        this.scheduleFeedbackClear(index);
        this.onMediaLibrary.emit();
      },
      error: () => {
        this.loadingStates[index] = false;
        this.feedbackStates[index] = { message: 'EDITION.ADVANCED_SETTINGS.ERROR', state: false };
        this.scheduleFeedbackClear(index);
      }
    });
  }
 
  private scheduleFeedbackClear(index: number): void {
    this.feedbackTimers[index] = setTimeout(() => {
      this.feedbackStates[index] = null;
    }, this.FEEDBACK_DURATION_MS);
  }

  public getDimension(mediaLibrary: MediaLibrary): string {
    if (!mediaLibrary.width && !mediaLibrary.height) return '—';
    return `${mediaLibrary.width} × ${mediaLibrary.height} px`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const insideSelect: boolean = this.selectSize?.nativeElement.contains(target);
    if (!insideSelect) {
      this.displaySelectSize = false;
    }
  }
}