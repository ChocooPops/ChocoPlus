import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { UserHistoricService } from '../../../service/user-historic/user-historic.service';
import { TopMedia } from '../../../dto/user-historic/top-media.interface';
import { TopMediaResponse } from '../../../dto/user-historic/top-media-response.interface';
import { MediaTypeFilter } from '../../../dto/user-historic/media-type-filter.type';
import { FilterOption } from '../../../dto/user-historic/filter-option.interface';
import { ScalePoster } from '../../../../common-module/models/scale-poster.enum';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';

@Component({
  standalone: true,
  selector: 'app-top-media',
  templateUrl: './top-media.component.html',
  styleUrls: ['./top-media.component.scss'],
  imports: [],
})
export class TopMediaComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() userId!: number;
  @ViewChild('mediaList') mediaListRef!: ElementRef<HTMLDivElement>;

  selectedMediaType: MediaTypeFilter = 'all';

  filterOptions: FilterOption[] = [
    { value: 'all', label: 'Tout', icon: '🎬' },
    { value: 'MOVIE', label: 'Films', icon: '🎥' },
    { value: 'SERIES', label: 'Séries', icon: '📺' },
  ];

  topMediaData: TopMediaResponse | null = null;
  loading: boolean = true;
  error: string | null = null;

  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  private mouseDownHandler?: (e: MouseEvent) => void;
  private mouseMoveHandler?: (e: MouseEvent) => void;
  private mouseUpHandler?: () => void;
  private mouseLeaveHandler?: () => void;
  srcReset: string = 'icon/modify.svg';
  srcLoading: string = 'icon/sablier.svg';

  constructor(
    private userHistoricService: UserHistoricService,
    private compressedPosterService: CompressedPosterService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setupDragScroll();
    }, 100);
  }

  ngOnDestroy(): void {
    this.removeDragScrollListeners();
  }

  private setupDragScroll(): void {
    const element = this.mediaListRef?.nativeElement;
    if (!element) {
      return;
    }

    this.mouseDownHandler = (e: MouseEvent) => {
      this.isDragging = true;
      element.classList.add('dragging');
      this.startX = e.pageX - element.offsetLeft;
      this.scrollLeft = element.scrollLeft;
      e.preventDefault();
    };

    this.mouseMoveHandler = (e: MouseEvent) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - this.startX) * 2;
      element.scrollLeft = this.scrollLeft - walk;
    };

    this.mouseUpHandler = () => {
      this.isDragging = false;
      element.classList.remove('dragging');
    };

    this.mouseLeaveHandler = () => {
      if (this.isDragging) {
        this.isDragging = false;
        element.classList.remove('dragging');
      }
    };

    element.addEventListener('mousedown', this.mouseDownHandler);
    element.addEventListener('mousemove', this.mouseMoveHandler);
    element.addEventListener('mouseup', this.mouseUpHandler);
    element.addEventListener('mouseleave', this.mouseLeaveHandler);
  }

  private removeDragScrollListeners(): void {
    const element = this.mediaListRef?.nativeElement;
    if (!element) return;

    if (this.mouseDownHandler) {
      element.removeEventListener('mousedown', this.mouseDownHandler);
    }
    if (this.mouseMoveHandler) {
      element.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.mouseUpHandler) {
      element.removeEventListener('mouseup', this.mouseUpHandler);
    }
    if (this.mouseLeaveHandler) {
      element.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }

    this.mouseDownHandler = undefined;
    this.mouseMoveHandler = undefined;
    this.mouseUpHandler = undefined;
    this.mouseLeaveHandler = undefined;
  }

  onFilterChange(mediaType: MediaTypeFilter): void {
    this.selectedMediaType = mediaType;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.userHistoricService
      .getUserTopMedia(this.userId, this.selectedMediaType)
      .subscribe({
        next: (data) => {
          this.topMediaData = data;
          this.loading = false;

          setTimeout(() => {
            this.removeDragScrollListeners();
            this.setupDragScroll();
          }, 100);
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement du top 10';
          this.loading = false;
        },
      });
  }

  getPosterUrl(media: TopMedia): string {
    if (media.posterName) {
      return `${this.compressedPosterService.insertIntoUrlBeforeFilename(media.posterName, ScalePoster.SCALE_600h)}`;
    }
    return '';
  }

  getMediaIcon(mediaType: string): string {
    return mediaType === 'MOVIE' ? '🎥' : '📺';
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
  }

  getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#a3a3a3';
    if (rank === 3) return '#CD7F32';
    return '#E6E6E6';
  }

  refresh(): void {
    this.loadData();
  }
}
