import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { SeriesService } from '../../../media-module/services/series/series.service';
import { NgClass } from '@angular/common';
import { SeasonModel } from '../../../media-module/models/series/season.interface';
import { Subscription, take } from 'rxjs';
import { EpisodeModel } from '../../../media-module/models/series/episode.interface';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { ScalePoster } from '../../../common-module/models/scale-poster.enum';

@Component({
  selector: 'app-edit-news-series-running',
  standalone: true,
  imports: [NgClass],
  templateUrl: './edit-news-series-running.component.html',
  styleUrls: ['./edit-news-series-running.component.css', '../../styles/edition.css']
})
export class EditNewsSeriesRunningComponent {

  @Input() series !: SeriesModel;
  @Input() currentJellyfinId !: string | undefined;
  @Output() changeJellyfinEpisode = new EventEmitter<string>();
  subscription !: Subscription;
  episodes: EpisodeModel[] | undefined = undefined;

  constructor(private seriesService: SeriesService,
    private compressedPosterService: CompressedPosterService
  ) { }

  ngOnDestroy(): void {
    this.unsubscriptionEpisode();
  }

  onChangeJellyfinEpisode(jellyfinId: string): void {
    this.changeJellyfinEpisode.emit(jellyfinId);
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
    if (this.series.seasons[index].episodes.length <= 0) {
      this.subscription = this.seriesService.fetchEpisodesBySeriesAndSeasonId(this.series.id, this.series.seasons[index].id).pipe(take(1)).subscribe((data: EpisodeModel[]) => {
        data.forEach((item: EpisodeModel) => {
          item.srcPoster = this.compressedPosterService.getEpisodePoster(item, ScalePoster.SCALE_300w);
        });
        this.series.seasons[index].episodes = data;
        this.episodes = this.series.seasons[index].episodes;
      })
    } else {
      this.episodes = this.series.seasons[index].episodes;
    }
  }

}
