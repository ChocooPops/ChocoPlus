import { Component } from '@angular/core';
import { VersionService } from '../../../../common-module/services/version/version.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  appVersion!: string;
  buildDate!: string;

  constructor(private readonly versionService: VersionService) { }

  async ngOnInit() {
    this.appVersion = await this.versionService.getCurrentVersion();
    this.buildDate = new Date().getFullYear().toString();
  }

}
