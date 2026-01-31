import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TitleBarComponent } from './common-module/components/title-bar/title-bar.component';
import { Subscription } from 'rxjs';
import { FullscreenService } from './common-module/services/fullscreen/fullscreen.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TitleBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'ChocoPlus';
  subscription : Subscription = new Subscription();
  isFullScreen !: boolean;

  constructor(private fullscreenService: FullscreenService) { }

  async ngOnInit() : Promise<void> {
    await this.fullscreenService.initFullScreen();
    this.subscription.add(
      this.fullscreenService.getIfScreenIsFull().subscribe((isFull: boolean) => {
        this.isFullScreen = isFull;
      })
    )
  }

  ngOnDestroy() : void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:keydown', ['$event'])
  async handleKeyboardEvent(event: KeyboardEvent): Promise<void> {
    if (event.key === 'F11') {
      event.preventDefault();
      await this.fullscreenService.toggleFullScreen();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      await this.fullscreenService.disableFullScreen();
    }
    if (event.key === ' ') {
      const target = event.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if (!isInput) {
        event.preventDefault();
      }
    }
  }
}
