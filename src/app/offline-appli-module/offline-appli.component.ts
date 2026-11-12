import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuBarComponent } from './menu/menu-bar/menu-bar.component';
import { MediaSelectedService } from '../main-appli-module/media-module/services/media-selected/media-selected.service';
import { Subscription } from 'rxjs';
import { MediaModel } from '../main-appli-module/media-module/models/media.interface';
import { MediaPageComponent } from '../main-appli-module/media-module/components/media-page/media-page/media-page.component';
import { VerifUserAlreadyConnectedService } from '../launch-module/services/verif-user-already-connected/verif-user-already-connected.service';
import { VideoPlayingComponent } from '../main-appli-module/video-playing-module/components/video-playing/video-playing.component';
import { PlayerSessionService } from '../main-appli-module/video-playing-module/services/player-session/player-session.service';

@Component({
  selector: 'app-offline-appli',
  standalone: true,
  imports: [RouterOutlet, MenuBarComponent, MediaPageComponent, VideoPlayingComponent],
  templateUrl: './offline-appli.component.html',
  styleUrl: './offline-appli.component.css'
})
export class OfflineAppliComponent {

  mediaSelected: MediaModel | undefined = undefined;
  isPlayerOpen: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private readonly mediaSelectedService: MediaSelectedService,
    private readonly verifUserAlreadyConnectedService: VerifUserAlreadyConnectedService,
    private readonly playerSessionService: PlayerSessionService
  ) {
    this.verifUserAlreadyConnectedService.setUserConnected(false);  
  }

  ngOnInit(): void {
    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((media: MediaModel | undefined) => {
        this.mediaSelected = media;
      })
    );
    this.subscription.add(
      this.playerSessionService.state$.subscribe((state) => {
        this.isPlayerOpen = state.mode !== 'closed';
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
