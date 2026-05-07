import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { FormPageDirectiveAbstract } from '../form-page.directive';
import { ButtonFormComponent } from '../button-form/button-form.component';
import { LoginModel } from '../../models/login.model';
import { catchError, forkJoin, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UserModel } from '../../../main-appli-module/user-module/dto/user.model';
import { VersionModel } from '../../models/version.interface';
import { BadVersionComponent } from '../bad-version/bad-version.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonFormComponent, BadVersionComponent, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../styles/form.css', '../../styles/input-form.css']
})
export class LoginComponent extends FormPageDirectiveAbstract {

  placeHolderEmail = 'LAUNCH.PLACEHOLDER.EMAIL';
  placeHolderAccessKey = 'LAUNCH.PLACEHOLDER.KEY';

  formControlEmail: string = 'inputEmail';
  formControlAccessKey: string = 'inputAccessKey';

  srcVisible: string = 'icon/visible.svg';
  srcNotVisible: string = 'icon/not-visible.svg';
  srcImageKey: string = this.srcNotVisible;
  type: 'password' | 'text' = 'password';
  activateSubmit: boolean = true;

  isGoodVersion: boolean = true;
  lastVersion!: VersionModel;

  override ngOnInit(): void {
    this.formGroup = this.fb.group({
      inputEmail: ['', [Validators.required]],
      inputAccessKey: ['', [Validators.required]]
    })
    this.formGroup.get(this.formControlAccessKey)?.valueChanges.subscribe(value => {
      this.type = 'password';
      this.srcImageKey = this.srcNotVisible;
    })
  }

  override onSubmit(): void {
    if (this.activateSubmit) {
      this.activateSubmit = false;
      if (this.formGroup.valid) {
        const login: LoginModel = {
          email: this.formGroup.get(this.formControlEmail)?.value,
          password: this.formGroup.get(this.formControlAccessKey)?.value
        }
        this.verifAuthLogin(login);
      } else {
        this.message = 'LAUNCH.MESSAGE.INVALID_FORM';
        this.activateSubmit = true;
      }
    }
  }

  private verifAuthLogin(login: LoginModel): void {
    this.message = 'LAUNCH.MESSAGE.LOADING';
    this.authService.fetchLogin(login).pipe(
      switchMap(() =>
        forkJoin({
          user: this.userService.fetchCurrentUser(),
          version: this.versionService.fetchLastVersion(),
          currentVersion: this.versionService.getCurrentVersion()
        })
      ),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.message = "LAUNCH.MESSAGE.NO_CONNECTION";
        } else if (error.status === 404) {
          this.message = 'LAUNCH.MESSAGE.INCORRECT_USERNAME';
        } else if (error.status === 401) {
          this.message = "LAUNCH.MESSAGE.USER_DISABLED";
        } else {
          this.message = 'LAUNCH.MESSAGE.ERROR';
        }
        this.activateSubmit = true;
        return throwError(() => error);
      })
    ).subscribe({
      next: (result: {
        user: UserModel,
        version: VersionModel | null,
        currentVersion: string
      }) => {
        const img: string[] = [];
        img.push(result.user.profilPhoto);

        this.imagePreloaderService.preloadImages(img).finally(() => {
          if (result.version) {
            this.lastVersion = result.version;
            this.isGoodVersion = this.versionService.isVersionGreater(result.currentVersion, this.lastVersion.num);
            if (this.isGoodVersion) {
              this.navigateToStreamApp();
            }
          } else {
            this.navigateToStreamApp();
          }
        })
      }
    });
  }

  navigateToRegisterPage(): void {
    this.router.navigateByUrl('register');
  }

  navigateToOfflineMode(): void {
    this.router.navigateByUrl('preload-offline-app');
  }

  navigateToStreamApp(): void {
    this.router.navigateByUrl('preload-stream-app');
  }

  onChangeVisibilityOfKeyAccess(): void {
    if (this.type === 'password') {
      this.type = 'text';
      this.srcImageKey = this.srcVisible;
    } else {
      this.type = 'password';
      this.srcImageKey = this.srcNotVisible;
    }
  }

  setGoodVersion(): void {
    this.isGoodVersion = true;
  }

}
