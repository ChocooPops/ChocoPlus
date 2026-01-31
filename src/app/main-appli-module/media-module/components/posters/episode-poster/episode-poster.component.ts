import { Component, Input, SimpleChanges } from '@angular/core';
import { EpisodeModel } from '../../../models/series/episode.interface';
import { VerifTimerShowService } from '../../../../common-module/services/verif-timer/verif-timer-show.service';
import { DatePipe } from '@angular/common';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { SeriesModel } from '../../../models/series/series.interface';

@Component({
  selector: 'app-episode-poster',
  standalone: true,
  imports: [DatePipe, StartButtonComponent],
  templateUrl: './episode-poster.component.html',
  styleUrl: './episode-poster.component.css'
})
export class EpisodePosterComponent {

  @Input() series!: SeriesModel;
  @Input() episodes!: EpisodeModel[];
  @Input() notRunning: boolean = true;

  episodePoster: any[] = [];
  type: MediaTypeModel = MediaTypeModel.SERIES;

  constructor(private verifTimerShowService: VerifTimerShowService,
    private compressedPosterService: CompressedPosterService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['episodes']) {
      this.episodePoster = [];
      this.episodes.forEach((episode: EpisodeModel) => {
        const poster: string | undefined = this.compressedPosterService.getEpisodePoster(episode)
        this.episodePoster.push(poster)
      });
    }
  }

  getTimerEpisode(timer: number): string {
    return this.verifTimerShowService.getFormatEpisode(timer)
  }

}
