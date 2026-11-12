import { Injectable } from '@angular/core';
import { VideoPlayerModel } from '../../models/video-player.enum';

// Player chosen in the app settings to play movies and episodes (the in-app player by default)
@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  private readonly videoPlayerKey: string = 'VIDEO_PLAYER';

  public setVideoPlayer(player: VideoPlayerModel): void {
    localStorage.setItem(this.videoPlayerKey, player);
  }

  public getVideoPlayer(): VideoPlayerModel {
    const value: string | null = localStorage.getItem(this.videoPlayerKey);
    return value === VideoPlayerModel.CHOCO_PLAYER ? VideoPlayerModel.CHOCO_PLAYER : VideoPlayerModel.INTERNAL;
  }

}
