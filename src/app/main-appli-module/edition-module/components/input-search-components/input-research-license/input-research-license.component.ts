import { Component, ElementRef } from '@angular/core';
import { InputResearchAbstract } from '../input-research-abstract';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LicenseModel } from '../../../../license-module/model/license.interface';
import { NgClass } from '@angular/common';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { ScalePoster } from '../../../../common-module/models/scale-poster.enum';
import { LicenseService } from '../../../../license-module/service/license/licence.service';

@Component({
  selector: 'app-input-research-license',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './input-research-license.component.html',
  styleUrls: ['./input-research-license.component.css', '../../../styles/search.css']
})
export class InputResearchLicenseComponent extends InputResearchAbstract<LicenseModel> {

  protected override placeHolder: string = 'Rechercher une license';

  constructor(fb: FormBuilder,
    elementRef: ElementRef,
    private LicenseService: LicenseService,
    private compressedPosterService: CompressedPosterService
  ) {
    super(fb, elementRef);
  }

  getPathPosterByLicense(licence: LicenseModel): string {
    let srcPoster = this.compressedPosterService.getLogoForLicense(licence, ScalePoster.SCALE_300w);
    if (srcPoster) {
      return srcPoster;
    } else {
      return '';
    }
  }

  protected override startResearch(): void {
    const value: string = this.getValueInput();
    this.LicenseService.fetchLicenseWanted(value).subscribe((data) => {
      this.contentWanted = data;
    });
  }

}
