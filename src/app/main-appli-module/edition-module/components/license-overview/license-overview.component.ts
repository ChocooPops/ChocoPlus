import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { LicenseModel } from '../../../license-module/model/license.interface';
import { Subscription } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { ButtonMoveComponent } from '../button-move/button-move.component';
import { NgClass } from '@angular/common';
import { HomeLicenseComponent } from '../../../license-module/components/home-license/home-license.component';
import { SearchLicenseComponent } from '../../../license-module/components/search-license/search-license.component';
import { PaginationLicenseService } from '../../../license-module/service/pagination-license/pagination-license.service';

@Component({
  selector: 'app-license-overview',
  standalone: true,
  imports: [SearchLicenseComponent, NgClass, ButtonMoveComponent, HomeLicenseComponent, ButtonMoveComponent],
  templateUrl: './license-overview.component.html',
  styleUrls: ['./license-overview.component.css', '../../../common-module/styles/animation.css']
})
export class LicenseOverviewComponent {

  subscription: Subscription = new Subscription();

  constructor(private paginationLicenseService: PaginationLicenseService) { }

  @Input() licenses: LicenseModel[] = []
  @Input() type!: boolean;
  @Output() emitActionUp = new EventEmitter<[number, number]>();
  @Output() emitActionDown = new EventEmitter<[number, number]>();
  @Output() emitActionLeft = new EventEmitter<[number, number]>();
  @Output() emitActionRight = new EventEmitter<[number, number]>();

  gap !: number;
  nbLicensePerline !: number;
  height: number = 0;

  public changeLocationToTop(id: number): void {
    this.emitActionUp.emit([id, this.nbLicensePerline]);
  }
  public changeLocationToBottom(id: number): void {
    this.emitActionDown.emit([id, this.nbLicensePerline]);
  }
  public changeLocationToLeft(id: number): void {
    this.emitActionLeft.emit([id, 1]);
  }
  public changeLocationToRight(id: number): void {
    this.emitActionRight.emit([id, 1]);
  }

  ngOnInit(): void {
    this.setSubscription();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['licenses']) {
      this.setSubscription();
    }
  }

  private setSubscription(): void {
    if (this.type) {
      this.subscription =
        this.paginationLicenseService.getHomeLicenseGeometricDimension().subscribe((geoDimension: GeometricDimensionSelectionModel) => {
          this.gap = geoDimension.gapBetweenPoster * 0.65;
          this.nbLicensePerline = geoDimension.nbPosterPerLine;
          const nbColumn: number = Math.ceil(this.licenses.length / this.nbLicensePerline);
          this.height = this.gap * nbColumn + (geoDimension.heightPoster * 0.65 * nbColumn);
        })
    } else {
      this.subscription =
        this.paginationLicenseService.getResearchLicenseGeometricDimension().subscribe((geoDimension: GeometricDimensionSelectionModel) => {
          this.gap = geoDimension.gapBetweenPoster * 0.65;
          this.nbLicensePerline = geoDimension.nbPosterPerLine;
          const nbColumn: number = Math.ceil(this.licenses.length / this.nbLicensePerline);
          this.height = this.gap * nbColumn + (geoDimension.heightPoster * 0.65 * nbColumn);
        })
    }
  }

  public getGridTemplate(): string {
    return "repeat(" + this.nbLicensePerline + ", auto)";
  }

}
