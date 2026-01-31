import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';
import { NgClass } from '@angular/common';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-bt-subtitle',
  standalone: true,
  imports: [BtClassicComponent, NgClass, TitleCasePipe],
  templateUrl: './bt-subtitle.component.html',
  styleUrl: './bt-subtitle.component.css'
})
export class BtSubtitleComponent {

  @Input() audios: { name: string, index: number }[] = [];
  @Input() subtitles: { name: string, index: number }[] = [];
  @Input() currentAudio !: number;
  @Input() currentSubtitle !: number;
  @Output() setDisplayControls = new EventEmitter<boolean>();
  @Output() changeAudio = new EventEmitter<number>();
  @Output() changeSubtitle = new EventEmitter<number>();

  srcImageSubtitles: string = 'icon/controls/subtitle.svg';
  state: boolean = false;
  isHovering: boolean = false;

  onClick(): void {
    this.state = !this.state;
  }

  onMouseEnter(): void {
    this.isHovering = true;
    this.setDisplayControls.emit(true);
  }

  onMouseLeaving(): void {
    this.isHovering = false;
    this.setDisplayControls.emit(false);
  }

  onChangeAudio(index: number): void {
    this.changeAudio.emit(index);
  }

  onChangeSubtitle(index: number): void {
    this.changeSubtitle.emit(index);
  }

}
