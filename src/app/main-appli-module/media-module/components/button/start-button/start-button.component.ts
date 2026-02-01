import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { MediaModel } from '../../../models/media.interface';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { StreamService } from '../../../../video-playing-module/services/stream/stream.service';
import { ChocoPlayerModel } from '../../../../video-playing-module/models/choco-player.interface';

@Component({
  selector: 'app-start-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './start-button.component.html',
  styleUrls: ['./start-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class StartButtonComponent {

  @Input() typeButton: boolean = false;
  @Input() typeDisplaying: boolean = false;
  @Input() media!: MediaModel;
  @Input() episodeId !: number;
  @Input() episodeName !: string;

  constructor(private router: Router,
    private streamService: StreamService,
  ) { }

  srcStartButton: string = "icon/start.svg";
  srcStartIcon: string = 'icon/start-icon.svg';

  public async onClick(): Promise<void> {
    const chocoPlayer: ChocoPlayerModel = {
      Title: this.media.title,
      Url: '',
      Height: window.innerHeight,
      Width: window.innerWidth
    }
    if (this.media.mediaType === MediaTypeModel.MOVIE) {
      chocoPlayer.Url = this.streamService.getUrlStreamMovie(this.media.id);
    } else if (this.media.mediaType === MediaTypeModel.SERIES) {
      chocoPlayer.Title = `${chocoPlayer.Title} - ${this.episodeName}`;
      chocoPlayer.Url = this.streamService.getUrlStreamEpisode(this.media.id, this.episodeId ?? -1);
    }

    await this.streamService.launchJavaAppToMovie(chocoPlayer);

    // if (this.media.mediaType === MediaTypeModel.MOVIE) {
    //   this.router.navigate(['/main-app/read-video', this.media.mediaType, this.media.id]);
    // } else if (this.media.mediaType === MediaTypeModel.SERIES) {
    //   if (this.idSeason && this.idEpisode) {
    //     this.router.navigate(['/main-app/read-video', this.media.mediaType, this.media.id, this.idSeason, this.idEpisode]);
    //   } else {
    //     this.router.navigate(['/main-app/read-video', this.media.mediaType, this.media.id, -1, -1]);
    //   }
    // }
  }

}
