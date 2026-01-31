import { Component, EventEmitter, Input, SimpleChanges, Output } from '@angular/core';
import { MediaModel } from '../../../models/media.interface';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-media-background',
  standalone: true,
  imports: [NgClass],
  templateUrl: './media-background.component.html',
  styleUrls: ['./media-background.component.css', '../../../../common-module/styles/animation.css']
})
export class MediaBackgroundComponent {

  @Input() media!: MediaModel;
  @Output() newEmitLoader = new EventEmitter<void>();

  srcLogo!: string | undefined;
  srcBackground!: string | undefined;
  title!: string;
  isLogoLoading: boolean = false;
  isBackLoading: boolean = false;
  isPosterLoading: boolean = false;
  displaying: boolean = false;

  constructor(private compressedPosterService: CompressedPosterService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['media']) {
      this.init();
    }
  }

  private init(): void {
    this.srcLogo = this.compressedPosterService.getLogoForMediaPresentation(this.media);
    this.srcBackground = this.compressedPosterService.getBackgroundForMediaPresentation(this.media);
    this.title = this.media.title;

    if (!this.srcLogo) {
      this.onLogoLoad();
    }

    if (!this.isBackLoading) {
      this.onBackgroundLoad();
    }
  }

  onErrorImageLogo(): void {
    this.srcLogo = undefined;
    this.onLogoLoad();
  }
  onLogoLoad(): void {
    this.isLogoLoading = true;
    if (this.isBackLoading && this.isPosterLoading) {
      this.displaying = true;
      this.newEmitLoader.emit();
    }
  }

  onErrorImageBackground(): void {
    this.srcBackground = undefined;
    this.onBackgroundLoad();
  }

  onBackgroundLoad(): void {
    this.isBackLoading = true;
    if (this.isLogoLoading && this.isPosterLoading) {
      this.displaying = true;
      this.newEmitLoader.emit();
    }
  }

  onPosterLoad(): void {
    this.isPosterLoading = true;
    if (this.isBackLoading && this.isLogoLoading) {
      this.displaying = true;
      this.newEmitLoader.emit();
    }
  }

  resetImageLoading(): void {
    this.isBackLoading = false;
    this.isLogoLoading = false;
    this.isPosterLoading = false;
    this.displaying = false;
  }

}
