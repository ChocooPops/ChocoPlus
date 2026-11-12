import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';
import { PlayerTrackOption } from '../../models/player.interface';
import { PlayerPanel } from '../player-panel/player-panel';

// Audio and subtitle tracks of the media, opened by hovering the button (hover logic: PlayerPanel)
@Component({
  selector: 'app-bt-subtitle',
  standalone: true,
  imports: [BtClassicComponent, NgClass, NgTemplateOutlet, TranslatePipe],
  templateUrl: './bt-subtitle.component.html',
  // Shared panel look first: the component's own rules (two-column grid...) come after and override it
  styleUrls: ['../../styles/player-panel.css', './bt-subtitle.component.css']
})
export class BtSubtitleComponent extends PlayerPanel {

  @Input() audios: PlayerTrackOption[] = [];
  @Input() subtitles: PlayerTrackOption[] = [];
  @Input() currentAudio !: number;
  @Input() currentSubtitle !: number;
  @Output() changeAudio = new EventEmitter<number>();
  @Output() changeSubtitle = new EventEmitter<number>();

  readonly srcImageSubtitles: string = 'icon/controls/subtitle.svg';
  readonly srcCheck: string = 'icon/success.svg';
  readonly subtitlesOff: PlayerTrackOption = { name: '', index: -1 };

  onChangeAudio(audio: PlayerTrackOption): void {
    if (audio.disabled || audio.index === this.currentAudio) return;
    this.changeAudio.emit(audio.index);
  }

  onChangeSubtitle(subtitle: PlayerTrackOption): void {
    if (subtitle.disabled || subtitle.index === this.currentSubtitle) return;
    this.changeSubtitle.emit(subtitle.index);
  }

}
