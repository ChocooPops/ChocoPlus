import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subscription, Observable, EMPTY } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-change-format-poster',
  standalone: true,
  imports: [NgClass],
  templateUrl: './change-format-poster.component.html',
  styleUrl: './change-format-poster.component.css'
})
export class ChangeFormatPosterComponent {

  subscriptionRouter !: Subscription;
  subscriptionFormat !: Subscription;
  format !: FormatPosterModel;
  currentRoute !: string;
  classFormatPoster: string = '';
  formatPoster = FormatPosterModel;
  isActivate: boolean = false;

  constructor(private router: Router,
    private formatPosterService: FormatPosterService,
  ) { }

  ngOnInit(): void {
    this.updateFormatPoster(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateFormatPoster((event as NavigationEnd).url);
      });
  }

  private updateFormatPoster(url: string): void {
    this.currentRoute = url;
    this.subscriptionFormat?.unsubscribe();

    const formatPosterMap: {
      test: (url: string) => boolean,
      get: () => Observable<FormatPosterModel>
    }[] = [
        {
          test: u => u === '/main-app/home',
          get: () => this.formatPosterService.fetchFormatPosterHome()
        },
        {
          test: u => u === '/main-app/movies',
          get: () => this.formatPosterService.fetchFormatPosterMovie()
        },
        {
          test: u => u === '/main-app/series',
          get: () => this.formatPosterService.fetchFormatPosterSeries()
        },
        {
          test: u => /^\/main-app\/license\/\d+$/.test(u),
          get: () => this.formatPosterService.fetchFormatPosterLicense()
        },
        {
          test: u => /^\/main-app\/search(\?.*)?$/.test(u),
          get: () => this.formatPosterService.fetchFormatPosterResearch()
        },
        {
          test: u => u === '/main-app/my-list',
          get: () => this.formatPosterService.fetchFormatPosterMyList()
        }
      ];

    const match = formatPosterMap.find(entry => entry.test(url));
    this.isActivate = !!match;

    this.subscriptionFormat = (match?.get ?? (() => EMPTY))()
      .subscribe((format: FormatPosterModel) => {
        if (format) {
          this.format = format;
          this.setClass(format);
        }
      });
  }

  private setClass(format: FormatPosterModel): void {
    if (format === FormatPosterModel.HORIZONTAL) {
      this.classFormatPoster = 'horizontal';
    } else if (format === FormatPosterModel.VERTICAL) {
      this.classFormatPoster = 'vertical';
    }
  }

  onToggleFormatPoster(): void {
    if (this.isActivate) {
      if (this.format === FormatPosterModel.VERTICAL) {
        this.format = FormatPosterModel.HORIZONTAL;
      } else if (this.format === FormatPosterModel.HORIZONTAL) {
        this.format = FormatPosterModel.VERTICAL;
      }
      if (this.currentRoute === '/main-app/home') {
        this.formatPosterService.setFormatPosterHome(this.format);
      } else if (this.currentRoute === '/main-app/movies') {
        this.formatPosterService.setFormatPosterMovie(this.format);
      } else if (this.currentRoute === '/main-app/series') {
        this.formatPosterService.setFormatPosterSeries(this.format);
      } else if (/^\/main-app\/license\/\d+$/.test(this.currentRoute)) {
        this.formatPosterService.setFormatPosterLicense(this.format);
      } else if (/^\/main-app\/search(\?.*)?$/.test(this.currentRoute)) {
        this.formatPosterService.setFormatPosterResearch(this.format)
      } else if (this.currentRoute === '/main-app/my-list') {
        this.formatPosterService.setFormatPosterMyList(this.format);
      }
      this.setClass(this.format);
    }
  }

}
