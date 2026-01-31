import { Component } from '@angular/core';
import { PosterAbstraction } from '../poster-abstraction.directive';
import { NgClass } from '@angular/common';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { ModifyButtonComponent } from '../../button/modify-button/modify-button.component';
import { MylistButtonComponent } from '../../button/mylist-button/mylist-button.component';
import { SelectionType } from '../../../models/selection-type.enum';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-horizontal-poster',
  standalone: true,
  imports: [NgClass, StartButtonComponent, ModifyButtonComponent, MylistButtonComponent, TitleCasePipe],
  templateUrl: './horizontal-poster.component.html',
  styleUrls: ['./horizontal-poster.component.css', '../../../../common-module/styles/animation.css']
})
export class HorizontalPosterComponent extends PosterAbstraction {

  override typePoster: SelectionType = SelectionType.HORIZONTAL_POSTER;
  protected override transformScale: number = 1.7;

  keyWord: string[] = [];

  public getRandomElements(tab: string[]): string[] {
    return tab
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
  }

  ngAfterViewInit(): void {
    if (this.media.keyWord && this.media.keyWord.length > 0) {
      this.keyWord = this.getRandomElements(this.media.keyWord);
    }
  }

  onErrorLogo(): void {
    this.srcLogo = undefined;
  }

}
