import { Component, Input } from '@angular/core';
import { MenuTabModel } from '../../model/menu-tab.interface';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-menu-tab',
  standalone: true,
  imports: [],
  templateUrl: './menu-tab.component.html',
  styleUrl: './menu-tab.component.css',
})

export class MenuTabComponent {

  @Input()
  menuTab !: MenuTabModel;

  @Input()
  activateUnderline: boolean = true;

  constructor(private router: Router,
    private route: ActivatedRoute
  ) { }

  public onClick() {
    if (this.menuTab.route.trim() !== "") {
      this.router.navigate([this.menuTab.route], { relativeTo: this.route });
    }
  }

}
