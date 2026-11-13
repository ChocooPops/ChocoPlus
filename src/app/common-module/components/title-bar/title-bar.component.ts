import { Component } from '@angular/core';
import { ElectronService } from '../../services/electron/electron.service';
import { Subscription, filter } from 'rxjs';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { VideoPlayerSwitchComponent } from '../video-player-switch/video-player-switch.component';
import { PlayerSessionService } from '../../../main-appli-module/video-playing-module/services/player-session/player-session.service';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [NgClass, VideoPlayerSwitchComponent],
  templateUrl: './title-bar.component.html',
  styleUrl: './title-bar.component.css'
})
export class TitleBarComponent {

  srcReduce: string = 'icon/reduce.svg';
  srcShrink: string = 'icon/shrink.svg';
  srcEnlarge: string = 'icon/enlarge.svg';
  srcClose: string = 'icon/close.svg';
  isMaximize !: boolean;
  subscription: Subscription = new Subscription();

  // Video player switch: only in the app (online / offline), not over a video covering the window
  displayPlayerSwitch: boolean = false;
  private isInApp: boolean = false;
  private isPlayerFull: boolean = false;

  constructor(private electronService: ElectronService,
    private router: Router,
    private playerSessionService: PlayerSessionService
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.electronService.getIsMaximize().subscribe((state: boolean) => {
        this.isMaximize = state;
      })
    )
    this.setIsInApp(this.router.url);
    this.subscription.add(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        this.setIsInApp(event.urlAfterRedirects);
      })
    )
    this.subscription.add(
      this.playerSessionService.state$.subscribe((state) => {
        this.isPlayerFull = state.mode === 'full';
        this.updateDisplayPlayerSwitch();
      })
    )
  }

  private setIsInApp(url: string): void {
    this.isInApp = url.startsWith('/main-app') || url.startsWith('/offline-app');
    this.updateDisplayPlayerSwitch();
  }

  private updateDisplayPlayerSwitch(): void {
    this.displayPlayerSwitch = this.isInApp && !this.isPlayerFull;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async onClickMinimize(): Promise<void> {
    await this.electronService.windowMinimize();
  }

  async onClickMaximize(): Promise<void> {
    this.isMaximize = await this.electronService.windowMaximize();
  }

  async onClickClose(): Promise<void> {
    await this.electronService.windowClose();
  }

}
