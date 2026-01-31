import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { PosterAbstraction } from '../poster-abstraction.directive';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { ModifyButtonComponent } from '../../button/modify-button/modify-button.component';
import { MylistButtonComponent } from '../../button/mylist-button/mylist-button.component';
import { SelectionType } from '../../../models/selection-type.enum';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-vertical-poster',
  standalone: true,
  imports: [NgClass, StartButtonComponent, MylistButtonComponent, ModifyButtonComponent, TitleCasePipe],
  templateUrl: './vertical-poster.component.html',
  styleUrls: ['./vertical-poster.component.css', '../../../../common-module/styles/animation.css']
})
export class VerticalPosterComponent extends PosterAbstraction {

  @Input() override displayOnEditionPage: boolean = false;

  override typePoster: SelectionType = SelectionType.NORMAL_POSTER;
  protected override transformScale: number = 2;
  keyWord: string[] = [];

  public getRandomElements(tab: string[]): string[] {
    return tab
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }

  ngAfterViewInit(): void {
    if (this.media.keyWord && this.media.keyWord.length > 0) {
      this.keyWord = this.getRandomElements(this.media.keyWord);
    }
  }

}
