import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { MediaModel } from '../../../models/media.interface';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { SelectionType } from '../../../models/selection-type.enum';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { MylistButtonComponent } from '../../button/mylist-button/mylist-button.component';

@Component({
  selector: 'app-similar-poster-vertical',
  standalone: true,
  imports: [StartButtonComponent, MylistButtonComponent],
  templateUrl: './similar-poster-vertical.component.html',
  styleUrl: './similar-poster-vertical.component.css',
})
export class SimilarPosterVerticalComponent {

  @Input() medias !: MediaModel[];
  @Output() onClicked = new EventEmitter<MediaModel>();
  
  private subscription!: Subscription;

  height!: number;
  width!: number;
  gap!: number;
  srcPoster: (string | undefined)[] = [];
  srcIconInfo: string = 'icon/info.svg';

  constructor(private readonly paginationPosterService: PaginationPosterService,
    private readonly compressedPosterService: CompressedPosterService
  ) {}

  ngOnInit(): void {
    this.medias.forEach((media: MediaModel) => {
      this.srcPoster.push(this.compressedPosterService.getPosterMedia(SelectionType.NORMAL_POSTER, media));
    });
    
    this.subscription = this.paginationPosterService
      .getVerticalGeometricDimensionSelection()
      .subscribe((data: GeometricDimensionSelectionModel) => {
        this.height =
          this.paginationPosterService.getRealHeighVerticalVerticalPoster();
        this.width = data.widthPoster;
        this.gap = data.gapBetweenPoster * 2;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onClickMovie(media: MediaModel): void {
    this.onClicked.emit(media);
  }

  onClickButton(event: Event) {
    event.stopPropagation();
  }

  onErrorImage(index: number): void {
    this.srcPoster[index] = undefined;
  }

}
