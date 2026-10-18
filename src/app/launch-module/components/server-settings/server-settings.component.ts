import { Component, ElementRef, HostListener } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServerSettingKeyTarModel } from '../../models/server-setting-key-tar.enum';
import { AuthService } from '../../services/auth/auth.service';
import { ElectronService } from '../../../common-module/services/electron/electron.service';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-server-settings',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule],
  templateUrl: './server-settings.component.html',
  styleUrls: ['./server-settings.component.css', '../../../common-module/styles/loader.css']
})
export class ServerSettingsComponent {

  public readonly ServerSettingKeyTar = ServerSettingKeyTarModel;
  public readonly srcIcon: string = 'icon/server-setting.svg';
  public readonly srcVisible: string = 'icon/visible.svg';
  public readonly srcNotVisible: string = 'icon/not-visible.svg';
  public readonly srcSuccess: string = 'icon/success.svg';
  public readonly srcError: string = 'icon/error.svg';

  public testStatus: TestStatus = 'idle';

  private subscription!: Subscription;

  public isTextVisible: { [key: string]: boolean } = {
    [this.ServerSettingKeyTar.SECURE_DOMAIN]: false,
    [this.ServerSettingKeyTar.DASHBOARD_KEY]: false
  };

  public isMenuOpen: boolean = false;
  public isMenuClosing: boolean = false;

  public readonly formGroup: FormGroup;

  constructor(private readonly elementRef: ElementRef<HTMLElement>, 
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly electronService: ElectronService)
  {
    this.formGroup = this.fb.group({
      MAIN_URL: [''],
      SECURE_DOMAIN: [''],
      DASHBOARD_KEY: ['']
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public isTesting(): boolean {
    return this.testStatus === 'loading';
  }

  public toggleMenu(): void {
    if (this.isMenuOpen && !this.isMenuClosing) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private openMenu(): void {
    if (!this.isMenuOpen) {
      this.loadFormValues();
    }
    this.isMenuOpen = true;
    this.isMenuClosing = false;
  }

  private loadFormValues(): void {
    this.formGroup.setValue({
      [ServerSettingKeyTarModel.MAIN_URL]: environment.apiUrl ?? '',
      [ServerSettingKeyTarModel.SECURE_DOMAIN]: environment.HEADER_NAME_FIELD_SECRET_API ?? '',
      [ServerSettingKeyTarModel.DASHBOARD_KEY]: environment.HEADER_SECRET_API ?? ''
    });
  }

  private closeMenu(): void {
    if (this.isMenuOpen) {
      this.isMenuClosing = true;
      if (this.testStatus !== 'loading') {
        this.testStatus = 'idle';
      }
    }
  }

  public onMenuAnimationEnd(event: AnimationEvent): void {
    if (this.isMenuClosing && event.animationName === 'leaveServerMenu') {
      this.isMenuOpen = false;
      this.isMenuClosing = false;
    }
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (this.isMenuOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  public toggleVisibility(field: string): void {
    this.isTextVisible[field] = !this.isTextVisible[field];
  }

  public hideText(field: string): void {
    this.isTextVisible[field] = false;
  }

  public onTest(): void {
    if (this.isTesting()) {
      return;
    }

    const { MAIN_URL, SECURE_DOMAIN, DASHBOARD_KEY } = this.formGroup.value;
    this.testStatus = 'loading';
    this.formGroup.disable();

    this.subscription?.unsubscribe();
    this.subscription = this.authService.testConnection(MAIN_URL, SECURE_DOMAIN, DASHBOARD_KEY).subscribe((isConnected: boolean) => {
        this.formGroup.enable();
        this.testStatus = isConnected ? 'success' : 'error';
      })
  }

  public hideTestResult(): void {
    if (this.isTesting()) {
      return;
    }
    this.testStatus = 'idle';
  }

  public async onSave(): Promise<void> {
    if (this.isTesting()) {
      return;
    }
    const { MAIN_URL, SECURE_DOMAIN, DASHBOARD_KEY } = this.formGroup.value;
    await Promise.all([
      this.authService.setKeyTarFromServerSetting(ServerSettingKeyTarModel.MAIN_URL, MAIN_URL ?? ''),
      this.authService.setKeyTarFromServerSetting(ServerSettingKeyTarModel.SECURE_DOMAIN, SECURE_DOMAIN ?? ''),
      this.authService.setKeyTarFromServerSetting(ServerSettingKeyTarModel.DASHBOARD_KEY, DASHBOARD_KEY ?? '')
    ]);
    await this.electronService.reloadWindow();
  }

}
