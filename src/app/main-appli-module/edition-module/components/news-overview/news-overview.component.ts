import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { NewsModel } from '../../../news-module/models/news.interface';
import { Subscription } from 'rxjs';
import { NewsComponent } from "../../../news-module/components/news/news.component";
import { PaginationLicenseService } from '../../../license-module/service/pagination-license/pagination-license.service';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { PaginationNewsService } from '../../../news-module/services/pagination-news/pagination-news.service';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';
import { ButtonDeleteComponent } from '../button-delete/button-delete.component';
import { ButtonMoveComponent } from '../button-move/button-move.component';
import { ButtonOrientationComponent } from '../button-orientation/button-orientation.component';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-news-overview',
  standalone: true,
  imports: [NewsComponent, ButtonDeleteComponent, ButtonMoveComponent, ButtonOrientationComponent, NgClass],
  templateUrl: './news-overview.component.html',
  styleUrl: './news-overview.component.css'
})
export class NewsOverviewComponent {

  @Input() newsList: NewsModel[] = [];
  @Output() emitDeleteNews = new EventEmitter<number>();
  @Output() emitOrientationNews = new EventEmitter<number[]>();
  @Output() emitSrcBackground = new EventEmitter<SimpleModel>()
  @Output() emitTop = new EventEmitter<number>();
  @Output() emitBottom = new EventEmitter<number>();

  height: number = 0;
  gap: number = 0;
  subscription: Subscription = new Subscription();
  dimension!: DimensionModel;

  constructor(private paginationLicenseService: PaginationLicenseService,
    private paginationNewsService: PaginationNewsService
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.paginationLicenseService.getHomeLicenseGeometricDimension().subscribe((data: GeometricDimensionSelectionModel) => {
        this.gap = data.gapBetweenPoster;
        this.paginationNewsService.setDimension(data.marginLeft);
      })
    );
    this.subscription.add(
      this.paginationNewsService.getDimensionNews().subscribe((data: DimensionModel) => {
        this.dimension = data;
        this.setHeight();
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['newsList']) {
      if (this.dimension) {
        this.setHeight();
      }
    }
  }

  private setHeight(): void {
    this.height = this.dimension.height * this.newsList.length * 0.64 + (this.gap * 3);
  }

  onDeleteNews(id: number): void {
    this.emitDeleteNews.emit(id);
  }
  onModifyOrientationNews(id: number, orientation: number): void {
    this.emitOrientationNews.emit([id, orientation]);
  }
  onModifySrcBackgroundNews(id: number, srcBackground: string): void {
    this.emitSrcBackground.emit({ id: id, name: srcBackground });
  }
  onMoveTop(id: number): void {
    this.emitTop.emit(id);
  }
  onMoveBottom(id: number): void {
    this.emitBottom.emit(id);
  }

}
