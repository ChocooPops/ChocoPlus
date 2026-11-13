import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { VideoPlayerService } from '../../../main-appli-module/common-module/services/video-player/video-player.service';
import { VideoPlayerModel } from '../../../main-appli-module/common-module/models/video-player.enum';

// Mini switch under the window buttons (title bar): plays the next movies / episodes in the app or with ChocoPlayer.
// Same setting as Settings → Other options → Video player. A video already playing is not affected.
@Component({
  selector: 'app-video-player-switch',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './video-player-switch.component.html',
  styleUrl: './video-player-switch.component.css'
})
export class VideoPlayerSwitchComponent implements OnInit, OnDestroy {

  readonly srcInternal: string = 'icon/player-internal.svg';
  readonly srcChocoPlayer: string = 'icon/player-choco.svg';
  isChocoPlayer: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(private readonly videoPlayerService: VideoPlayerService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.videoPlayerService.videoPlayer$.subscribe((player: VideoPlayerModel) => {
        this.isChocoPlayer = player === VideoPlayerModel.CHOCO_PLAYER;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onToggle(): void {
    this.videoPlayerService.toggleVideoPlayer();
  }

}
