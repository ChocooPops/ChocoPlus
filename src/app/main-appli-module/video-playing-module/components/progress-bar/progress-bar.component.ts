import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { GlobalFormattingService } from '../../../common-module/services/global-formatting/global-formatting.service';

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

  // Time code under the mouse: position on the bar (0 - 100), null when not shown
  previewPercent: number | null = null;
  previewTime: string = '';
  private isHovering: boolean = false;

  constructor(private globalFormattingService: GlobalFormattingService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentTimeTravelledInSecond']) {
      this.currentTimeTravelled = this.globalFormattingService.converSecondInFormatToStream(this.currentTimeTravelledInSecond);
      this.progress = this.currentTimeTravelledInSecond / this.totalDurationMovieInSecond * 100;
    }
    if (changes['totalDurationMovieInSecond']) {
      this.totalDurationMovie = this.globalFormattingService.converSecondInFormatToStream(this.totalDurationMovieInSecond);
    }
  }

  // Position of the mouse along the bar, 0 - 1 (held at the ends when dragging beyond them)
  private getPointerRatio(event: MouseEvent): number {
    const rect = this.progressRef.nativeElement.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  }

  // Time code shown above the bar, where the mouse is (hover) or where the bar is dragged to
  private showPreview(ratio: number): void {
    if (!(this.totalDurationMovieInSecond > 0)) {
      this.previewPercent = null;
      return;
    }
    this.previewPercent = ratio * 100;
    this.previewTime = this.globalFormattingService.converSecondInFormatToStream(ratio * this.totalDurationMovieInSecond);
  }

  onHoverProgressBar(event: MouseEvent): void {
    this.isHovering = true;
    this.showPreview(this.getPointerRatio(event));
  }

  onLeaveProgressBar(): void {
    this.isHovering = false;
    // While dragging, the time code follows the mouse even outside the bar
    if (!this.isDraggingProgressBar) {
      this.previewPercent = null;
    }
  }

  updateProgressBar(event: MouseEvent): void {
    if (!(this.totalDurationMovieInSecond > 0)) return;
    const ratio = this.getPointerRatio(event);
    this.progress = ratio * 100;
    this.showPreview(ratio);
    this.changeCurrentTime.emit(Math.floor(ratio * this.totalDurationMovieInSecond));
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
      if (!this.isHovering) {
        this.previewPercent = null;
      }
    }
  }

}
