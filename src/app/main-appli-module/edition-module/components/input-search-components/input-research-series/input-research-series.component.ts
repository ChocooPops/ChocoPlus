import { Component, ElementRef } from '@angular/core';
import { InputResearchAbstract } from '../input-research-abstract';
import { SeriesModel } from '../../../../media-module/models/series/series.interface';
import { FormBuilder } from '@angular/forms';
import { SeriesService } from '../../../../media-module/services/series/series.service';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { SelectionType } from '../../../../media-module/models/selection-type.enum';
import { ScalePoster } from '../../../../common-module/models/scale-poster.enum';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-research-series',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './input-research-series.component.html',
  styleUrls: ['./input-research-series.component.css', '../../../styles/search.css']
})
export class InputResearchSeriesComponent extends InputResearchAbstract<SeriesModel> {

  protected override placeHolder: string = 'Rechercher une série';

  constructor(fb: FormBuilder,
    elementRef: ElementRef,
    private seriesService: SeriesService,
    private compressedPosterService: CompressedPosterService
  ) {
    super(fb, elementRef);
  }

  getPathPosterByMovie(media: SeriesModel): string {
    let srcPoster = this.compressedPosterService.getPosterMedia(SelectionType.NORMAL_POSTER, media, ScalePoster.SCALE_100h);
    if (srcPoster) {
      return srcPoster;
    } else {
      return '';
    }
  }

  protected override startResearch(): void {
    const value: string = this.getValueInput();
    this.seriesService.fetchSeriesWanted(value).subscribe((data) => {
      this.contentWanted = data;
    })
  }

}
