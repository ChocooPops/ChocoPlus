import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { PosterAbstraction } from '../poster-abstraction.directive';
import { SelectionType } from '../../../models/selection-type.enum';

@Component({
  selector: 'app-license-poster',
  standalone: true,
  imports: [NgClass],
  templateUrl: './license-poster.component.html',
  styleUrl: './license-poster.component.css'
})
export class LicensePosterComponent extends PosterAbstraction {

  override typePoster: SelectionType = SelectionType.LICENSE_POSTER;
  protected override transformScale: number = 1.15;

}
