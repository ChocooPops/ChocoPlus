import { Component, Input, Output, EventEmitter } from '@angular/core';
import { JobModel } from '../../../models/job.eum';
import { Subscription } from 'rxjs';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { CreditModel } from '../../../models/credit.interface';

@Component({
  selector: 'app-staff-poster',
  standalone: true,
  imports: [],
  templateUrl: './staff-poster.component.html',
  styleUrl: './staff-poster.component.css',
})
export class StaffPosterComponent {

  @Input() jobTitle!: JobModel;
  @Input() credits: CreditModel[] = [];
  @Input() mediaType!: MediaTypeModel;
  @Output() onClickCreditEmit = new EventEmitter<CreditModel>();

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
    this.credits.forEach((staff: CreditModel) => {
      this.srcPoster.push(this.compressedPosterService.getStaffPoster(staff));
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

  onClickCredit(staff: CreditModel): void {
    this.onClickCreditEmit.emit(staff);
  }
  
  onErrorImage(index: number): void {
    this.srcPoster[index] = undefined;
  }

}
