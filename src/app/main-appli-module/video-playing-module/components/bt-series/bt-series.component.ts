import { Component, Input, HostListener, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { EpisodeModel } from '../../../media-module/models/series/episode.interface';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { Subscription, take } from 'rxjs';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { EpisodePosterComponent } from '../../../media-module/components/posters/episode-poster/episode-poster.component';
import { EpisodePosterLoadingComponent } from '../../../media-module/components/posters/episode-poster-loading/episode-poster-loading.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-bt-series',
  standalone: true,
  imports: [BtClassicComponent, EpisodePosterComponent, EpisodePosterLoadingComponent, NgClass],
  templateUrl: './bt-series.component.html',
  styleUrl: './bt-series.component.css'
})
export class BtSeriesComponent {

  @Input() series!: SeriesModel;
  @Input() idx !: number;
  @Output() setDisplayControls = new EventEmitter<boolean>();
  @ViewChild('select', { static: false }) selectRef !: ElementRef;

  private abortController = new AbortController();
  srcImage: string = 'icon/controls/series.svg';
  srcArrow: string = 'icon/arrow.svg';
  episodes: EpisodeModel[] | undefined = undefined;
  currentIndexSeasons!: number;
  state: boolean = false;
  subscription: Subscription = new Subscription();
  displaySelect: boolean = false;
  isHovering: boolean = false;

  constructor(private seriesService: SeriesService,
    private imagePreloaderService: ImagePreloaderService
  ) { }

  ngOnInit(): void {
    this.currentIndexSeasons = this.idx;
    this.fetchEpisodeBySeason(this.series.id, this.idx);
  }

  onClick(): void {
    this.state = !this.state;
  }

  private fetchEpisodeBySeason(idSeason: number, indexSeason: number): void {
    if (this.series.seasons[indexSeason].episodes.length <= 0) {
      this.episodes = undefined;
      this.abortController.abort();
      this.subscription = this.seriesService.fetchEpisodesBySeriesAndSeasonId(this.series.id, idSeason).pipe(take(1)).subscribe((data: EpisodeModel[]) => {
        const img: string[] = this.imagePreloaderService.getPosterFromEpisodes(data);
        this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
          this.series.seasons[indexSeason].episodes = data;
          this.episodes = this.series.seasons[indexSeason].episodes;
        });
      });
    } else {
      this.episodes = this.series.seasons[indexSeason].episodes;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.abortController.abort();
  }

  onClickDisplay(): void {
    this.displaySelect = !this.displaySelect;
  }

  onClickSeason(idx: number): void {
    this.currentIndexSeasons = idx;
    this.fetchEpisodeBySeason(this.series.id, idx);
  }

  onClickContainer(event: MouseEvent): void {
    if (this.selectRef) {
      const clickInsideSubject: boolean = this.selectRef.nativeElement.contains(event.target);
      if (!clickInsideSubject) {
        this.displaySelect = false;
      }
    }
  }

  onMouseEnter(): void {
    this.isHovering = true;
    this.setDisplayControls.emit(true);
  }

  onMouseLeaving(): void {
    this.isHovering = false;
    this.setDisplayControls.emit(false);
  }

}
