import { Component, ElementRef, EventEmitter, Input, Output, ViewChildren, QueryList, SimpleChanges } from '@angular/core';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { VerticalPosterComponent } from '../../../media-module/components/posters/vertical-poster/vertical-poster.component';
import { SpecialPosterComponent } from '../../../media-module/components/posters/special-poster/special-poster.component';
import { LicensePosterComponent } from '../../../media-module/components/posters/license-poster/license-poster.component';
import { NgClass } from '@angular/common';
import { ButtonDeleteComponent } from '../button-delete/button-delete.component';
import { ButtonMoveComponent } from '../button-move/button-move.component';
import { Subscription } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { PaginationPosterService } from '../../../media-module/services/pagination-poster/pagination-poster.service';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';

@Component({
  selector: 'app-selection-overview',
  standalone: true,
  imports: [ButtonMoveComponent, ButtonDeleteComponent, NgClass, VerticalPosterComponent, SpecialPosterComponent, LicensePosterComponent],
  templateUrl: './selection-overview.component.html',
  styleUrls: ['./selection-overview.component.css', '../../../common-module/styles/animation.css']
})
export class SelectionOverviewComponent {

  @ViewChildren('selection') selection!: QueryList<ElementRef<HTMLDivElement>>;
  height: number = 0;
  gapBetweenSelection: number = 0;
  gapBetweenMedia: number = 0;
  subscription: Subscription = new Subscription();
  SelectionType = SelectionType;

  @Input()
  displaButtonForMediaLicense: boolean = true;

  @Input()
  mediaSelectionList !: SelectionModel[];

  @Input()
  displaySettingSelection: boolean = false;

  @Output()
  moveMediaLeftEmit = new EventEmitter<number>

  @Output()
  moveMediaRightEmit = new EventEmitter<number>

  @Output()
  removeMediaEmit = new EventEmitter<number>

  @Output()
  moveSelectionBottomEmit = new EventEmitter<number>

  @Output()
  moveSelectionTopEmit = new EventEmitter<number>

  @Output()
  removeSelectionEmit = new EventEmitter<number>

  constructor(private paginationPosterService: PaginationPosterService) { }

  moveMediaOnLeft(id: number): void {
    this.moveMediaLeftEmit.emit(id);
  }

  moveMediaOnRight(id: number): void {
    this.moveMediaRightEmit.emit(id);
  }

  removeMedia(id: number): void {
    this.removeMediaEmit.emit(id);
  }

  moveSelectionOnBottom(id: number): void {
    this.moveSelectionBottomEmit.emit(id);
  }

  moveSelectionOnTop(id: number): void {
    this.moveSelectionTopEmit.emit(id);
  }

  removeSelection(id: number): void {
    this.removeSelectionEmit.emit(id);
  }

  private setSubscription(): void {
    this.subscription.add(
      this.paginationPosterService.getVerticalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.gapBetweenMedia = dimension.gapBetweenPoster;
        this.gapBetweenSelection = dimension.heightPoster * 0.17;
        this.setDimensionOverview();
      })
    )
  }

  ngAfterViewInit(): void {
    this.setSubscription();
  }

  ngOnInit(): void {
    this.setSubscription();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mediaSelectionList']) {
      setTimeout(() => {
        this.setDimensionOverview();
      }, 10)
    }
  }

  setDimensionOverview(): void {
    let newGap: number = this.gapBetweenSelection * 0.67;
    if (this.selection) {
      let height: number = 0;
      this.selection.forEach((element: ElementRef) => {
        const rect = element.nativeElement.getBoundingClientRect();
        height += parseFloat(rect.height);
      });
      this.height = (height / window.innerWidth) * 100 + this.mediaSelectionList.length * newGap;
    }
  }

}
