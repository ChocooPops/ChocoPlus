import { Component, OnInit, Input } from '@angular/core';
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
  imports: []
})
export class TopMediaComponent implements OnInit {

  @Input() userId!: number;

  selectedMediaType: MediaTypeFilter = 'all';

  filterOptions: FilterOption[] = [
    { value: 'all', label: 'Tout', icon: '🎬' },
    { value: 'MOVIE', label: 'Films', icon: '🎥' },
    { value: 'SERIES', label: 'Séries', icon: '📺' }
  ];

  topMediaData: TopMediaResponse | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(private userHistoricService: UserHistoricService,
    private compressedPosterService: CompressedPosterService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  onFilterChange(mediaType: MediaTypeFilter): void {
    this.selectedMediaType = mediaType;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.userHistoricService.getUserTopMedia(this.userId, this.selectedMediaType).subscribe({
      next: (data) => {
        this.topMediaData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du top 10';
        this.loading = false;
      }
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
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#FFD81F';
  }

  refresh(): void {
    this.loadData();
  }
}