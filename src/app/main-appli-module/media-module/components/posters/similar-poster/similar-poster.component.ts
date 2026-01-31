import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectionType } from '../../../models/selection-type.enum';
import { MylistButtonComponent } from '../../button/mylist-button/mylist-button.component';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { VerifTimerShowService } from '../../../../common-module/services/verif-timer/verif-timer-show.service';
import { DatePipe } from '@angular/common';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { MediaModel } from '../../../models/media.interface';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { MovieModel } from '../../../models/movie-model';
import { SeriesModel } from '../../../models/series/series.interface';

@Component({
  selector: 'app-similar-poster',
  standalone: true,
  imports: [MylistButtonComponent, StartButtonComponent, DatePipe],
  templateUrl: './similar-poster.component.html',
  styleUrl: './similar-poster.component.css'
})
export class SimilarPosterComponent {

  @Input() media !: MediaModel;
  @Output() onClicked = new EventEmitter<MediaModel>();
  duration !: string;
  quality !: string;
  description !: string;
  date !: Date;
  srcPoster: string | undefined = undefined;
  srcLogo: string | undefined = undefined;
  MediaType = MediaTypeModel;
  nbSeason !: string;

  constructor(private compressedPosterService: CompressedPosterService,
    private verifTimerShowService: VerifTimerShowService) { }

  ngOnInit(): void {
    this.srcPoster = this.compressedPosterService.getPosterMedia(SelectionType.HORIZONTAL_POSTER, this.media);
    this.srcLogo = this.compressedPosterService.getLogoForMedia(this.media);
    this.description = this.media.description || '';

    if (this.media.mediaType === MediaTypeModel.MOVIE) {
      this.duration = this.verifTimerShowService.extractHourAndMinute((this.media as MovieModel).time) || '1 h 30 min';
      this.quality = (this.media as MovieModel).quality || 'any quality';
      this.date = (this.media as MovieModel).date || new Date();
    } else if (this.media.mediaType === MediaTypeModel.SERIES) {
      const nb: number = (this.media as SeriesModel).seasons.length;
      if (nb > 1) {
        this.nbSeason = `${nb} Saisons`;
      } else {
        this.nbSeason = `${nb} Saison`;
      }
    }
  }

  onErrorImage(): void {
    this.srcPoster = undefined;
  }

  onErrorLogo(): void {
    this.srcLogo = undefined;
  }

  onClickMovie(): void {
    this.onClicked.emit(this.media);
  }

  onClickButton(event: Event) {
    event.stopPropagation();
  }

}
