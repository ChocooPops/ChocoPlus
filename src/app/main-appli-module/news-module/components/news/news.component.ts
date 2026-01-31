import { Component, Input, SimpleChanges } from '@angular/core';
import { NewsModel } from '../../models/news.interface';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { PaginationNewsService } from '../../services/pagination-news/pagination-news.service';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';

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

  constructor(private compressedPosterService: CompressedPosterService,
    private mediaSelectedService: MediaSelectedService,
    private paginationNewsService: PaginationNewsService
  ) { }

  srcLogo: string | undefined = undefined;
  orientationClass!: string;
  subscription: Subscription = new Subscription();
  dimension!: DimensionModel;

  ngOnInit(): void {
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
