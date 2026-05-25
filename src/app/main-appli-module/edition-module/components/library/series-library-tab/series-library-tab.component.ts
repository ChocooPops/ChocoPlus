import { Component, ElementRef, Input, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { MediaLibrary } from '../../../models/library/media-library.interface';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageReturnedModel } from '../../../../../common-module/models/message-returned.interface';
import { LibraryService } from '../../../services/library/library.service';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { PopupComponent } from '../../popup/popup.component';
import { LogViewerModalComponent } from '../log-viewer-modal/log-viewer-modal.component';

type SeriesTypeFilter = 'ALL' | 'SERIES' | 'SEASON' | 'EPISODE';

interface PagedItem {
  mediaLibrary: MediaLibrary;
  originalIndex: number;
}

@Component({
  selector: 'app-series-library-tab',
  standalone: true,
  imports: [FormsModule, TranslatePipe, NgClass, PopupComponent, LogViewerModalComponent],
  templateUrl: './series-library-tab.component.html',
  styleUrl: './series-library-tab.component.css'
})
export class SeriesLibraryTabComponent {

  private readonly messageTmdb = 'EDITION.LIBRARY.MESSAGE_TMDB';
  private readonly messagePath = 'EDITION.LIBRARY.MESSAGE_PATH';

  @ViewChild("popupTmdb") popupTmdb !: PopupComponent;
  @ViewChild("popupPath") popupPath !: PopupComponent;

  @Input() mediaLibraries: MediaLibrary[] = [];
  @Output() onMediaLibrary = new EventEmitter<void>();
  @ViewChild('selectSize') selectSize!: ElementRef;

  feedbackStates: (any | null)[] = [];
  loadingStates: boolean[] = [];
  private feedbackTimers: ReturnType<typeof setTimeout>[] = [];
  private seriesLibrarySelectedTmdbId: MediaLibrary | null = null;
  private seriesLibrarySelectedPath: MediaLibrary | null = null;
  private previousValueTmdbId: number | null = null;
  private previousValuePath: string | null = null;

  // Log viewer modal state
  logViewerOpen: boolean = false;
  logViewerData: any | null = null;
  logViewerPath: string = '';

  srcIconSave: string = 'icon/save.svg';

  searchQuery: string = '';
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

  constructor(private readonly elementRef: ElementRef,
    private readonly libraryService: LibraryService) { }

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

  toggleFilterTmdb(): void {
    this.filterMissingTmdb = !this.filterMissingTmdb;
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
        if (q && !ml.titleFormated?.toLowerCase().includes(q) && !ml.id.toLowerCase().includes(q)) return false;
        if (this.filterType !== 'ALL' && ml.type !== this.filterType) return false;
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

  onFocusTmdbId(seriesLibrary: MediaLibrary): void {
    this.previousValueTmdbId = seriesLibrary.tmdbId;
  }
  onBlurTmdbId(seriesLibrary: MediaLibrary): void {
    const newValue = seriesLibrary.tmdbId;
    if (this.previousValueTmdbId !== newValue) {
      this.seriesLibrarySelectedTmdbId = seriesLibrary;
      this.popupTmdb.setMessage(this.messageTmdb, undefined);
      this.popupTmdb.setDisplayPopup(true);
      this.popupTmdb.setDisplayButton(true);
    }
  }
  rollbackTmdbId(): void {
    if (this.previousValueTmdbId) {
      const index: number = this.mediaLibraries.findIndex((item) => item.id === this.seriesLibrarySelectedTmdbId?.id);
      if (index >= 0) {
        this.mediaLibraries[index].tmdbId = this.previousValueTmdbId;
      }
    }
    this.previousValueTmdbId = null;
    this.seriesLibrarySelectedTmdbId = null;
  }

  onFocusPath(seriesLibrary: MediaLibrary): void {
    this.previousValuePath = seriesLibrary.path;
  }
  onBlurPath(seriesLibrary: MediaLibrary): void {
    const newValue = seriesLibrary.path;
    if (this.previousValuePath !== newValue) {
      this.seriesLibrarySelectedPath = seriesLibrary;
      this.popupPath.setMessage(this.messagePath, undefined);
      this.popupPath.setDisplayPopup(true);
      this.popupPath.setDisplayButton(true);
    }
  }
  rollbackPath(): void {
    if (this.previousValuePath) {
      const index: number = this.mediaLibraries.findIndex((item) => item.id === this.seriesLibrarySelectedPath?.id);
      if (index >= 0) {
        this.mediaLibraries[index].path = this.previousValuePath;
      }
    }
    this.previousValuePath = null;
    this.seriesLibrarySelectedPath = null;
  }

  modifyTmdbIdFromMediaLibrary(): void {
    if (!this.seriesLibrarySelectedTmdbId) return;
    this.popupTmdb.setMessage(undefined, undefined);
    this.popupTmdb.setDisplayButton(false);
    this.libraryService.modifyTmdbIdFromMediaLibrary(this.seriesLibrarySelectedTmdbId).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popupTmdb.setMessage(data.message, data.state);
        this.popupTmdb.setEndTask(true);
        if (data.state) {
          if (data.state && Array.isArray(data.other) && data.other.length > 0) {
            const updatedIds = new Set<string>(data.other);
            this.mediaLibraries = this.mediaLibraries.map((ml) =>
              updatedIds.has(ml.id) ? { ...ml, tmdbId: this.seriesLibrarySelectedTmdbId?.tmdbId ?? 0 } : ml
            );
            this.applyFilters();
          }
          this.previousValueTmdbId = null;
        }
        this.rollbackTmdbId();
      },
      error: (error: HttpErrorResponse) => {
        this.rollbackTmdbId();
        this.popupTmdb.setMessage(JSON.stringify(error), false);
      }
    });
  }

  modifyPathFromMediaLibrary(): void {
    console.log(this.seriesLibrarySelectedPath)
    if (!this.seriesLibrarySelectedPath) return;
    this.popupPath.setMessage(undefined, undefined);
    this.popupPath.setDisplayButton(false);
    this.libraryService.modifyPathFromMediaLibrary(this.seriesLibrarySelectedPath).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popupPath.setMessage(data.message, data.state);
        this.popupPath.setEndTask(true);
        if (data.state) {
          if (data.state) {
            const index = this.mediaLibraries.findIndex((item) => item.id === this.seriesLibrarySelectedPath?.id);
            if (index >= 0) {
              this.mediaLibraries[index] = { ...this.mediaLibraries[index], ...data.other};
              this.applyFilters();
            }
          }
          this.previousValuePath = null;
        }
        this.rollbackPath();
      },
      error: (error: HttpErrorResponse) => {
        this.rollbackPath();
        this.popupPath.setMessage(JSON.stringify(error), false);
      }
    });
  }

  reloadMediaLibraryMetedata(mediaLibrary: MediaLibrary, index: number): void {
    if (mediaLibrary.type !== 'SERIES') return;
    if (this.loadingStates[index]) return;

    this.loadingStates[index] = true;
    this.feedbackStates[index] = null;
    clearTimeout(this.feedbackTimers[index]);

    this.libraryService.fetchReloadMediaLibraryMetedata(mediaLibrary.id).subscribe({
      next: (result: MessageReturnedModel) => {
        this.loadingStates[index] = false;
        if (result.message && typeof result.message === 'string') {
          result.message = result.message.split('\n').map((item) => item.trim()).filter((item) => item !== '') as any;
        }
        this.feedbackStates[index] = result;
        this.onMediaLibrary.emit();
        this.scheduleFeedbackClear(index);
      },
      error: () => {
        this.loadingStates[index] = false;
        this.feedbackStates[index] = { message: 'EDITION.ADVANCED_SETTINGS.ERROR', state: false };
        this.scheduleFeedbackClear(index);
      }
    });
  }

  reloadMediaLibraryFile(mediaLibrary: MediaLibrary, index: number): void {
    if (mediaLibrary.type !== 'SERIES') return;
    if (this.loadingStates[index]) return;

    this.loadingStates[index] = true;
    this.feedbackStates[index] = null;
    clearTimeout(this.feedbackTimers[index]);

    this.libraryService.fetchReloadMediaLibraryFile(mediaLibrary.id).subscribe({
      next: (result: MessageReturnedModel) => {
        this.loadingStates[index] = false;
        if (result.message && typeof result.message === 'string') {
          result.message = result.message.split('\n').map((item) => item.trim()).filter((item) => item !== '') as any;
        }
        this.feedbackStates[index] = result;
        this.onMediaLibrary.emit();
        this.scheduleFeedbackClear(index);
      },
      error: () => {
        this.loadingStates[index] = false;
        this.feedbackStates[index] = { message: 'EDITION.ADVANCED_SETTINGS.ERROR', state: false };
        this.scheduleFeedbackClear(index);
      }
    });
  }

  openLogViewerForRow(index: number, mediaLibrary: MediaLibrary): void {
    const fb = this.feedbackStates[index];
    if (!fb) return;
    this.logViewerData = fb;
    this.logViewerPath = mediaLibrary.path;
    this.logViewerOpen = true;
  }

  closeLogViewer(): void {
    this.logViewerOpen = false;
    this.logViewerData = null;
    this.logViewerPath = '';
  }

  private scheduleFeedbackClear(index: number): void {
    this.feedbackTimers[index] = setTimeout(() => {
      //this.feedbackStates[index] = null;
    }, this.FEEDBACK_DURATION_MS);
  }

  public getDimension(mediaLibrary: MediaLibrary): string {
    if (!mediaLibrary.width && !mediaLibrary.height) return '—';
    return `${mediaLibrary.width} × ${mediaLibrary.height}`;
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