import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-volume-button',
  standalone: true,
  imports: [],
  templateUrl: './volume-button.component.html',
  styleUrls: ['./volume-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class VolumeButtonComponent {

  @Input() volume !: number;
  @Output() changeVolume = new EventEmitter<number>

  state: boolean = true;

  srcSound: string = 'icon/sound.svg';
  srcMute: string = 'icon/mute.svg';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['volume']) {
      if (this.volume > 0) {
        this.state = true;
      } else {
        this.state = false;
      }
    }
  }

  onVolumeChange(): void {
    if (this.state) {
      this.changeVolume.emit(0);
    } else {
      this.changeVolume.emit(0.5);
    }
    this.state = !this.state;
  }

}
