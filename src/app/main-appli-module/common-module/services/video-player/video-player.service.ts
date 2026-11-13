import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VideoPlayerModel } from '../../models/video-player.enum';

// Player chosen to play movies and episodes (the in-app player by default). Changed from the app settings
// or the switch of the menu bar: both follow videoPlayer$.
@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  private readonly videoPlayerKey: string = 'VIDEO_PLAYER';
  private readonly videoPlayerSubject = new BehaviorSubject<VideoPlayerModel>(this.readVideoPlayer());
  public readonly videoPlayer$: Observable<VideoPlayerModel> = this.videoPlayerSubject.asObservable();

  public setVideoPlayer(player: VideoPlayerModel): void {
    localStorage.setItem(this.videoPlayerKey, player);
    if (player !== this.videoPlayerSubject.value) {
      this.videoPlayerSubject.next(player);
    }
  }

  public getVideoPlayer(): VideoPlayerModel {
    return this.videoPlayerSubject.value;
  }

  public toggleVideoPlayer(): void {
    this.setVideoPlayer(this.getVideoPlayer() === VideoPlayerModel.CHOCO_PLAYER ? VideoPlayerModel.INTERNAL : VideoPlayerModel.CHOCO_PLAYER);
  }

  private readVideoPlayer(): VideoPlayerModel {
    const value: string | null = localStorage.getItem(this.videoPlayerKey);
    return value === VideoPlayerModel.CHOCO_PLAYER ? VideoPlayerModel.CHOCO_PLAYER : VideoPlayerModel.INTERNAL;
  }

}
