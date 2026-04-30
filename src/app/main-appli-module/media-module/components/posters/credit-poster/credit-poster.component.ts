import { Component, Input, Output, EventEmitter } from '@angular/core';
import { JobModel } from '../../../models/job.eum';
import { Subscription } from 'rxjs';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { MediaCreditModel } from '../../../models/media-credit.interface';

@Component({
  selector: 'app-credit-poster',
  standalone: true,
  imports: [],
  templateUrl: './credit-poster.component.html',
  styleUrl: './credit-poster.component.css',
})
export class CreditPosterComponent {

  @Input() jobTitle!: JobModel;
  @Input() credits: MediaCreditModel[] = [];
  @Input() mediaType!: MediaTypeModel;
  @Output() onClickCreditEmit = new EventEmitter<MediaCreditModel>();

  private subscription!: Subscription;

  height!: number;
  width!: number;
  gap!: number;
  JobModel = JobModel;
  MediaTypeModel = MediaTypeModel;

  minPoster = 4;
  posterTmp: number[] = [];
  srcPoster: (string | undefined)[] = [];
  srcIconStaff: string = 'icon/person.svg';

  constructor(private readonly paginationPosterService: PaginationPosterService,
    private readonly compressedPosterService: CompressedPosterService
  ) {}

  ngOnInit(): void {
    for(let i=0; i< this.minPoster - this.credits.length; i++) {
      this.posterTmp.push(i);
    }
    this.credits.forEach((staff: MediaCreditModel) => {
      this.srcPoster.push(this.compressedPosterService.getCreditPoster(staff));
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

  onClickCredit(staff: MediaCreditModel): void {
    this.onClickCreditEmit.emit(staff);
  }
  
  onErrorImage(index: number): void {
    this.srcPoster[index] = undefined;
  }

}
