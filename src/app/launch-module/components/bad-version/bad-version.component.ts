import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VersionModel } from '../../models/version.interface';
import { Router } from '@angular/router';
import { VersionService } from '../../../common-module/services/version/version.service';

@Component({
  selector: 'app-bad-version',
  standalone: true,
  imports: [],
  templateUrl: './bad-version.component.html',
  styleUrl: './bad-version.component.css'
})
export class BadVersionComponent {

  @Input() version!: VersionModel;
  @Output() onContinue = new EventEmitter<void>();
  srcIcon: string = 'icon/bad-version.svg';

  constructor(private readonly router: Router,
    private readonly versionService: VersionService
  ) { }

  onClickContinue(): void {
    this.onContinue.emit();
    this.router.navigateByUrl('preload-stream-app');
  }

  async onClickDowload(): Promise<void> {
    await this.versionService.openExternalWindows(this.version.link);
  }

}
