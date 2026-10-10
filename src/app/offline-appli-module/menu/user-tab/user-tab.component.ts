import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ElectronService } from '../../../common-module/services/electron/electron.service';

@Component({
  selector: 'app-user-tab',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './user-tab.component.html',
  styleUrl: './user-tab.component.css'
})
export class UserTabComponent {

  public readonly srcDefaultPp: string = 'pp/pp.jpg';
  public readonly srcConnection: string = 'icon/connection.svg';
  class: string = 'not-visible-under-menu';
  classArrow: string = 'arrow-not-clicked';
  srcReset: string = 'icon/modify.svg';

  constructor(private readonly router: Router,
    private readonly electronService: ElectronService
  ) { }

  onMouseEnter(): void {
    this.class = 'visible-under-menu';
    this.classArrow = 'arrow-clicked';
  }

  onMouseLeave(): void {
    this.class = 'not-visible-under-menu';
    this.classArrow = 'arrow-not-clicked';
  }

  onClickConnection(): void {
    this.router.navigate(['']);
  }

  async onClickReset(): Promise<void> {
    await this.electronService.deleteCacheAndCookies();
    this.electronService.reloadWindow();
  }

}
