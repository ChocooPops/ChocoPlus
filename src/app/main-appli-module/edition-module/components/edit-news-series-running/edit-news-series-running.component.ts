import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { NgClass } from '@angular/common';
import { SeasonModel } from '../../../media-module/models/series/season.interface';
import { Subscription, take } from 'rxjs';
import { EpisodeModel } from '../../../media-module/models/series/episode.interface';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { ScalePoster } from '../../../common-module/models/scale-poster.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-news-series-running',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './edit-news-series-running.component.html',
  styleUrls: ['./edit-news-series-running.component.css', '../../styles/edition.css']
})
export class EditNewsSeriesRunningComponent {

  @Input() series !: SeriesModel;
  @Input() currentMediaLibraryId !: string | undefined;
  @Output() changeMediaLibraryEpisode = new EventEmitter<string>();
  subscription !: Subscription;
  episodes: EpisodeModel[] | undefined = undefined;

  constructor(private readonly seriesService: SeriesService,
    private readonly compressedPosterService: CompressedPosterService
  ) { }

  ngOnDestroy(): void {
    this.unsubscriptionEpisode();
  }

  onChangeMediaLibraryInEpisode(mediaLibraryId: string): void {
    this.changeMediaLibraryEpisode.emit(mediaLibraryId);
  }

  onClickSeason(index: number): void {
    this.series.seasons.forEach((season: SeasonModel, idx: number) => {
      if (idx === index) {
        season.isClicked = true;
        this.fetchEpisodeBySeason(index);
      } else {
        season.isClicked = false;
      }
    })
  }

  private unsubscriptionEpisode(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private fetchEpisodeBySeason(index: number): void {
    this.episodes = undefined;
    this.unsubscriptionEpisode();
    this.subscription = this.seriesService.fetchEpisodesBySeriesAndSeasonId(this.series.id, this.series.seasons[index].id).pipe(take(1)).subscribe((data: EpisodeModel[]) => {
      data.forEach((item: EpisodeModel) => {
        item.srcPoster = this.compressedPosterService.getEpisodePoster(item, ScalePoster.SCALE_300w);
      });
      this.episodes = data;
    })
  }

}
