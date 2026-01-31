import { Component } from '@angular/core';
import { FullscreenService } from '../../../../common-module/services/fullscreen/fullscreen.service';
import { Subscription } from 'rxjs';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';

@Component({
  selector: 'app-bt-fullscreen',
  standalone: true,
  imports: [BtClassicComponent],
  templateUrl: './bt-fullscreen.component.html',
  styleUrl: './bt-fullscreen.component.css'
})
export class BtFullscreenComponent {

  isFullScreen !: boolean;
  subscritpion: Subscription = new Subscription();
  srcImageFullScreen: string = 'icon/controls/fullscreen.svg';
  srcImageNotFullScreen: string = 'icon/controls/notfullscreen.svg';

  constructor(private fullscreenService: FullscreenService) { }

  ngOnInit(): void {
    this.subscritpion = this.fullscreenService.getIfScreenIsFull().subscribe((bol: boolean) => {
      this.isFullScreen = bol;
    })
  }

  ngOnDestroy(): void {
    this.subscritpion.unsubscribe();
  }

  onClicked(): void {
    this.fullscreenService.toggleFullScreen();
  }

}
