import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { EditionMovieService } from '../../services/edition-movie/edition-movie.service';
import { InputPosterModel } from '../../models/input-poster.interface';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { EditTypePoster } from '../../models/edit-type-movie.interface';
import { EditionSeriesService } from '../../services/edition-series/edition-series.service';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';

@Component({
  selector: 'app-input-selection-type',
  standalone: true,
  imports: [NgClass],
  templateUrl: './input-selection-type.component.html',
  styleUrl: './input-selection-type.component.css'
})
export class InputSelectionTypeComponent {

  @Input() mediaType!: MediaTypeModel;
  srcArrow: String = 'icon/arrow.svg';
  nameSelectedType !: String;
  isClick: boolean = false;

  constructor(private editionMovieService: EditionMovieService,
    private editionSeriesService: EditionSeriesService,
    private elementRef: ElementRef
  ) { }

  @Input()
  poster!: InputPosterModel;

  @Input()
  selectionId!: number;

  ngOnInit(): void {
    if (this.mediaType === MediaTypeModel.MOVIE) {
      this.nameSelectedType = this.editionMovieService.getOldSelectedPoster(this.poster.id, this.selectionId);
    } else if (this.mediaType === MediaTypeModel.SERIES) {
      this.nameSelectedType = this.editionSeriesService.getOldSelectedPoster(this.poster.id, this.selectionId);
    }
  }

  onClick() {
    this.isClick = true;
  }

  onClickSelection(type: SelectionType) {
    if (this.mediaType === MediaTypeModel.MOVIE) {
      this.nameSelectedType = this.editionMovieService.getSelectionPosterById(type);
      this.editionMovieService.modifySelectionInPoster(this.poster.id, this.selectionId, type);
      this.isClick = false;
    } else if (this.mediaType === MediaTypeModel.SERIES) {
      this.nameSelectedType = this.editionSeriesService.getSelectionPosterById(type);
      this.editionSeriesService.modifySelectionInPoster(this.poster.id, this.selectionId, type);
      this.isClick = false;
    }
  }

  getSelectionNotSelected(): EditTypePoster[] {
    if (this.mediaType === MediaTypeModel.MOVIE) {
      return this.editionMovieService.getSelectionNotSelected(this.poster.id);
    } else if (this.mediaType === MediaTypeModel.SERIES) {
      return this.editionSeriesService.getSelectionNotSelected(this.poster.id);
    } else {
      return [];
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isClick = false;
    }
  }

}
