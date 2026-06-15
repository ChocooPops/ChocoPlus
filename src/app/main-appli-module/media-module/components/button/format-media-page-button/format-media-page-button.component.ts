import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { FormatMediaPageModel } from '../../../models/format-media-page-enum';
import { FormatMediaPageService } from '../../../services/format-media-page/format-media-page-button.service';

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

  constructor(private readonly formatMediaPageService: FormatMediaPageService) { }

  ngOnInit(): void {
    this.subscription = this.formatMediaPageService.fetchCurrentFormatMediaPage().subscribe((value: FormatMediaPageModel) => {
      if (value === FormatMediaPageModel.VERTICAL) {
        this.currentClass = this.verticalClass;
      } else {
        this.currentClass = this.horizontalClass;
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