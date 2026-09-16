import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-download-menu-button',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './download-menu-button.component.html',
  styleUrl: './download-menu-button.component.css'
})
export class DownloadMenuButtonComponent {

  public srcDownload: string = 'icon/dl.svg';

  constructor(private readonly router: Router) { }

  onClick(): void {
    this.router.navigateByUrl('main-app/downloads');
  }

}
