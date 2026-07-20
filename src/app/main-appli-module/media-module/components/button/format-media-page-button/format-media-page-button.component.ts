import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { FormatMediaPageModel } from '../../../models/format-media-page-enum';
import { FormatMediaPageService } from '../../../services/format-media-page/format-media-page-button.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-format-media-page-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './format-media-page-button.component.html',
  styleUrls: ['../../../../common-module/styles/movie-button.css', './format-media-page-button.component.css']
})
export class FormatMediaPageButtonComponent {

  srcButton = 'icon/format-media-page.svg';
  srcButtonPressed = 'icon/format-media-page-pressed.svg';
  subscription !: Subscription;

  currentClass: string = '';
  verticalClass: string = 'vertical';
  horizontalClass: string = 'horizontal';

  title!: string;

  constructor(private readonly formatMediaPageService: FormatMediaPageService,
    private readonly translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.subscription = this.formatMediaPageService.fetchCurrentFormatMediaPage().subscribe((value: FormatMediaPageModel) => {
      if (value === FormatMediaPageModel.VERTICAL) {
        this.currentClass = this.verticalClass;
        this.title = this.translateService.instant('TUTO.SWITCH_LANDSCAPE_MODE');
      } else {
        this.currentClass = this.horizontalClass;
        this.title = this.translateService.instant('TUTO.SWITCH_PORTRAIT_MODE');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onClick(): void {
    this.formatMediaPageService.toggleFormatMediaPage();
  }

}