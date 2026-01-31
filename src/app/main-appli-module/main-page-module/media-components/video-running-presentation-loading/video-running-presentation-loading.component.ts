import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { StartButtonComponent } from '../../../media-module/components/button/start-button/start-button.component';
import { VlcButtonComponent } from '../../../media-module/components/button/vlc-button/vlc-button.component';
import { VolumeButtonComponent } from '../../../media-module/components/button/volume-button/volume-button.component';
import { MylistButtonComponent } from '../../../media-module/components/button/mylist-button/mylist-button.component';
import { ModifyButtonComponent } from '../../../media-module/components/button/modify-button/modify-button.component';

@Component({
  selector: 'app-video-running-presentation-loading',
  standalone: true,
  imports: [NgClass, StartButtonComponent, ModifyButtonComponent, MylistButtonComponent, VlcButtonComponent, VolumeButtonComponent],
  templateUrl: './video-running-presentation-loading.component.html',
  styleUrls: ['./video-running-presentation-loading.component.css', '../video-running-presentation/video-running-presentation.component.css', '../../../common-module/styles/animation.css']
})
export class VideoRunningPresentationLoadingComponent {

  text: string = 'aaaaaaaaaaaaaaaa aaaaaaaaaaaaa aaaaaaaaaaaa aaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaa aaaaaaaaaaaaaaaaa aaaaaaaaaaa aaaaaa aaaaaaaaa aaaaa aaaaaaaaaaaaaaa aaaaaaa aaaaa aaaaaaaaaaaa aaa aaaaaa aaaaaaa aaaaaaaa aaaaaaa aaa aaaaa aaaaaaaaaa aaaaaa aaaa aaaa aaa aaaaaaaaaa aaaaaaa aaaaaaaa aa aa aaaa a aaaaaaaaaaa aaaaaaa aaaa aa aaa aaa aaaaaaaaaaa aaaaaaa aaa aaaaaaaaaaa aaaaaaaa aaa aaaaaaaaa aaaaaaaa'

}
