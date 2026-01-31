import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';

@Component({
  selector: 'app-news-loading',
  standalone: true,
  imports: [NgClass],
  templateUrl: './news-loading.component.html',
  styleUrls: ['./news-loading.component.css', '../../../common-module/styles/animation.css']
})
export class NewsLoadingComponent {

  @Input() dimension !: DimensionModel;

}
