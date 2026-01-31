import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-bt-volume',
  standalone: true,
  imports: [BtClassicComponent, NgClass],
  templateUrl: './bt-volume.component.html',
  styleUrl: './bt-volume.component.css'
})
export class BtVolumeComponent {

  @ViewChild('volumeRef') volumeRef !: ElementRef;
  @Input() currentVolume !: number;
  @Output() onChangeVolume = new EventEmitter<number>();
  @Output() setDisplayControls = new EventEmitter<boolean>();

  volumeTmp !: number;
  isVolumeSounded!: boolean;
  srcImageSound: string = 'icon/controls/sound.svg';
  srcImageMute: string = 'icon/controls/mute.svg';
  volumeIntensityChanged: number = 0.05;
  progressSound: number = 0;

  volumeIsDragging: boolean = false;
  volumeIsHover: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentVolume']) {
      if (this.currentVolume > 0.02) {
        this.isVolumeSounded = true;
      } else {
        this.isVolumeSounded = false;
      }
      this.progressSound = this.currentVolume * 100;
    }
  }

  onClickVolume(): void {
    if (this.currentVolume > 0) {
      this.volumeTmp = this.currentVolume;
      this.onChangeVolume.emit(0);
    } else {
      this.onChangeVolume.emit(this.volumeTmp);
    }
  }

  displayProgressVolume(): void {
    this.volumeIsHover = true;
    this.setDisplayControls.emit(true);
  }

  hiddenProgressVolume(): void {
    this.volumeIsHover = false;
    this.setDisplayControls.emit(false);
  }

  startDragSound(event: MouseEvent): void {
    this.volumeIsHover = true;
    this.volumeIsDragging = true;
    this.updateProgressSound(event);
  }

  onDragSound(event: MouseEvent): void {
    if (this.volumeIsDragging) {
      this.updateProgressSound(event);
    }
  }

  endDragSound(event: MouseEvent): void {
    if (this.volumeIsDragging) {
      this.volumeIsDragging = false;
      this.updateProgressSound(event);
    }
  }


  updateProgressSound(event: MouseEvent): void {
    const rect = this.volumeRef.nativeElement.getBoundingClientRect();
    this.volumeIsHover = true;
    const clickY = event.clientY - rect.top;
    const newVolume = (rect.height - clickY) / rect.height;

    if (newVolume >= 0 && newVolume <= 1) {
      //this.progressSound = newVolume * 100;
      this.onChangeVolume.emit(newVolume);
    }
  }

}
