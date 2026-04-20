import { Component, Input } from '@angular/core';
import { StaffModel } from '../../../models/staff.interface';
import { JobModel } from '../../../models/job.eum';
import { Subscription } from 'rxjs';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { MediaTypeModel } from '../../../models/media-type.enum';

@Component({
  selector: 'app-staff-poster',
  standalone: true,
  imports: [],
  templateUrl: './staff-poster.component.html',
  styleUrl: './staff-poster.component.css',
})
export class StaffPosterComponent {
  @Input() jobTitle!: JobModel;
  @Input() staffs: StaffModel[] = [];
  @Input() mediaType!: MediaTypeModel;
  private subscription!: Subscription;

  height!: number;
  width!: number;
  gap!: number;
  JobModel = JobModel;
  MediaTypeModel = MediaTypeModel;

  minPoster = 4;
  posterTmp: number[] = [];

  constructor(private paginationPosterService: PaginationPosterService) {}

  ngOnInit(): void {
    for(let i=0; i< this.minPoster - this.staffs.length; i++) {
      this.posterTmp.push(i);
    }
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
}
