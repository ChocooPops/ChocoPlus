import { Component, ElementRef } from '@angular/core';
import { InputResearchAbstract } from '../input-research-abstract';
import { CreditService } from '../../../../media-module/services/credit/credit.service';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MediaCreditModel } from '../../../../media-module/models/media-credit.interface';
import { ScalePoster } from '../../../../common-module/models/scale-poster.enum';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input-research-credit',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './input-research-credit.component.html',
  styleUrls: ['./input-research-credit.component.css', '../../../styles/search.css']
})
export class InputResearchCreditComponent extends InputResearchAbstract<MediaCreditModel> {
  
  protected override placeHolder: string = 'Rechercher un acteur/réalisateur ...';

  constructor(
    fb: FormBuilder,
    elementRef: ElementRef,
    private readonly creditService: CreditService,
    private readonly compressedPosterService: CompressedPosterService,
  ) {
    super(fb, elementRef);
  }

  getPathPosterByMovie(credit: MediaCreditModel): string {
    let srcPoster = this.compressedPosterService.getCreditPoster(credit, ScalePoster.SCALE_300h);
    if (srcPoster) {
      return srcPoster;
    } else {
      return '';
    }
  }

  protected override startResearch(): void {
    const value: string = this.getValueInput();
    this.creditService.fetchCreditWanted(value).subscribe((data) => {
      this.contentWanted = data;
    });
  }

}
