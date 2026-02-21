import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-tab',
  standalone: true,
  imports: [NgClass],
  templateUrl: './user-tab.component.html',
  styleUrl: './user-tab.component.css'
})
export class UserTabComponent {

  srcDefaultPp: string = 'pp/pp.jpg';
  srcConnection: string = 'icon/connection.svg';
  class: string = 'not-visible-under-menu';
  classArrow: string = 'arrow-not-clicked';

  constructor(private router: Router) {

  }

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

}
