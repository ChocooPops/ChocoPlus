import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ExecutionVLCService } from '../../../services/execution-vlc/execution-vlc.service';

@Component({
  selector: 'app-vlc-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './vlc-button.component.html',
  styleUrls: ['./vlc-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class VlcButtonComponent {

  @Input() typeButton: boolean = false;
  @Input() jellyfinId !: string;

  srcImage: string = "icon/vlcInput.svg";

  constructor(private executionVLCService: ExecutionVLCService) { }

  async onClick(): Promise<void> {
    if (this.jellyfinId != undefined) {
      await this.executionVLCService.openVLCWithVideo(this.jellyfinId);
    }
  }

}
