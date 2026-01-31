import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { VerifTimerShowService } from '../../../common-module/services/verif-timer/verif-timer-show.service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css'
})
export class ProgressBarComponent {

  @ViewChild('progressRef') progressRef !: ElementRef;

  @Input() currentTimeTravelledInSecond !: number;
  @Input() totalDurationMovieInSecond !: number;
  @Output() changeCurrentTime = new EventEmitter<number>();

  progress: number = 0;
  isDraggingProgressBar: boolean = false;

  currentTimeTravelled !: string;
  totalDurationMovie !: string;

  constructor(private verifTimerShowService: VerifTimerShowService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentTimeTravelledInSecond']) {
      this.currentTimeTravelled = this.verifTimerShowService.converSecondInFormatToStream(this.currentTimeTravelledInSecond);
      this.progress = this.currentTimeTravelledInSecond / this.totalDurationMovieInSecond * 100;
    }
    if (changes['totalDurationMovieInSecond']) {
      this.totalDurationMovie = this.verifTimerShowService.converSecondInFormatToStream(this.totalDurationMovieInSecond);
    }
  }

  updateProgressBar(event: MouseEvent): void {
    const rect = this.progressRef.nativeElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    let newTime = Math.floor((clickX / rect.width) * this.totalDurationMovieInSecond);

    if (newTime <= this.totalDurationMovieInSecond && newTime >= 0) {
      this.progress = (newTime / this.totalDurationMovieInSecond) * 100;
      this.changeCurrentTime.emit(newTime);
    }
  }

  startDragProgressBar(event: MouseEvent): void {
    this.isDraggingProgressBar = true;
    this.updateProgressBar(event);
  }

  onDragProgressBar(event: MouseEvent): void {
    if (this.isDraggingProgressBar) {
      this.updateProgressBar(event);
    }
  }
  endDragProgressBar(event: MouseEvent): void {
    if (this.isDraggingProgressBar) {
      this.isDraggingProgressBar = false;
      this.updateProgressBar(event);
    }
  }

}
