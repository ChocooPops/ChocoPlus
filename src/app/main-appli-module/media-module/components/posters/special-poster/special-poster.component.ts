import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { PosterAbstraction } from '../poster-abstraction.directive';
import { SelectionType } from '../../../models/selection-type.enum';

@Component({
  selector: 'app-special-poster',
  standalone: true,
  imports: [NgClass],
  templateUrl: './special-poster.component.html',
  styleUrl: './special-poster.component.css'
})
export class SpecialPosterComponent extends PosterAbstraction {

  override typePoster: SelectionType = SelectionType.SPECIAL_POSTER;
  protected override transformScale: number = 1.05;

}
