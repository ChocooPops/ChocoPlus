import { Component, Input, SimpleChanges } from '@angular/core';
import { NewsModel } from '../../models/news.interface';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { PaginationNewsService } from '../../services/pagination-news/pagination-news.service';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';
import { MediaLogoDisplayService } from '../../../common-module/services/media-logo-display/media-logo-display.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [NgClass],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css', '../../../common-module/styles/animation.css']
})
export class NewsComponent {

  @Input() news !: NewsModel;
  @Input() orientation!: number;
  @Input() srcBackground!: string | undefined;

  constructor(private readonly compressedPosterService: CompressedPosterService,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly paginationNewsService: PaginationNewsService,
    private readonly mediaLogoDisplayService: MediaLogoDisplayService
  ) { }

  srcLogo: string | undefined = undefined;
  showLogo: boolean = true;
  orientationClass!: string;
  subscription: Subscription = new Subscription();
  dimension!: DimensionModel;

  ngOnInit(): void {
    this.showLogo = this.mediaLogoDisplayService.getShowLogo();
    this.srcLogo = this.compressedPosterService.getLogoForMediaPresentationTopHead(this.news.media);
    this.srcBackground = this.compressedPosterService.getBackgroundForNewsToHome(this.news);
    this.subscription.add(
      this.paginationNewsService.getDimensionNews().subscribe((dimension: DimensionModel) => {
        this.dimension = dimension;
      })
    )
  }

  setOrientationClass(): void {
    if (this.orientation === 1) {
      this.orientationClass = "top";
    } else if (this.orientation === 2) {
      this.orientationClass = "bottoom";
    } else {
      this.orientationClass = "center";
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orientation']) {
      this.setOrientationClass();
    }
    if (changes['srcBackground']) {
      this.srcBackground = this.compressedPosterService.getBackgroundForNewsToHome(this.news);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onErrorBack() {
    this.srcBackground = undefined;
  }

  onErrorLogo() {
    this.srcLogo = undefined;
  }

  onClickNews(): void {
    this.mediaSelectedService.selectMedia(this.news.media);
  }

}
