import { Component, EventEmitter, Input, SimpleChanges, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { MediaModel } from '../../../../models/media.interface';
import { CompressedPosterService } from '../../../../../common-module/services/compressed-poster/compressed-poster.service';

@Component({
  selector: 'app-media-vertical-background',
  standalone: true,
  imports: [NgClass],
  templateUrl: './media-background.component.html',
  styleUrls: ['./media-background.component.css', '../../../../../common-module/styles/animation.css']
})
export class MediaBackgroundVerticalComponent {

  @Input() media!: MediaModel;
  @Output() newEmitLoader = new EventEmitter<void>();

  srcLogo!: string | undefined;
  srcBackground!: string | undefined;
  title!: string;
  displaying: boolean = false;

  private logoLoaded: boolean = false;
  private backgroundLoaded: boolean = false;
  private posterLoaded: boolean = false;

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

    if (!this.srcLogo) this.onLogoLoad();
    if (!this.srcBackground) this.onBackgroundLoad();
  }

  private checkAllLoaded(): void {
    if (this.logoLoaded && this.backgroundLoaded && this.posterLoaded) {
      this.displaying = true;
      this.newEmitLoader.emit();
    }
  }

  onLogoLoad(): void {
    this.logoLoaded = true;
    this.checkAllLoaded();
  }

  onErrorImageLogo(): void {
    this.srcLogo = undefined;
    this.onLogoLoad();
  }

  onBackgroundLoad(): void {
    this.backgroundLoaded = true;
    this.checkAllLoaded();
  }

  onErrorImageBackground(): void {
    this.srcBackground = undefined;
    this.onBackgroundLoad();
  }

  onPosterLoad(): void {
    this.posterLoaded = true;
    this.checkAllLoaded();
  }

  resetImageLoading(): void {
    this.logoLoaded = false;
    this.backgroundLoaded = false;
    this.posterLoaded = false;
    this.displaying = false;
  }

}
