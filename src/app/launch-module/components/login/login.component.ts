import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { FormPageDirectiveAbstract } from '../form-page.directive';
import { ButtonFormComponent } from '../button-form/button-form.component';
import { LoginModel } from '../../models/login.model';
import { UserModel } from '../../../main-appli-module/user-module/dto/user.model';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonFormComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../styles/form.css', '../../styles/input-form.css']
})
export class LoginComponent extends FormPageDirectiveAbstract {

  placeHolderEmail: string = 'Email';
  placeHolderAccessKey: string = "Saisissez votre clef d'accès";

  formControlEmail: string = 'inputEmail';
  formControlAccessKey: string = 'inputAccessKey';

  srcVisible: string = 'icon/visible.svg';
  srcNotVisible: string = 'icon/not-visible.svg';
  srcImageKey: string = this.srcNotVisible;
  type: 'password' | 'text' = 'password';
  activateSubmit: boolean = true;

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
        this.message = 'Formulaire incorrect';
        this.activateSubmit = true;
      }
    }
  }

  private verifAuthLogin(login: LoginModel): void {
    this.message = 'Chargement ...';
    this.authService.fetchLogin(login).pipe(
      switchMap(() => this.userService.fetchCurrentUser()),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.message = "Aucune connexion";
        } else if (error.status === 404) {
          this.message = 'pseudo ou mot de passe incorrect';
        } else if (error.status === 401) {
          this.message = "L'utilisateur n'est pas activé ou a été désactivé";
        } else {
          this.message = 'Erreur';
        }
        this.activateSubmit = true;
        return throwError(() => error);
      })
    ).subscribe({
      next: (user: UserModel) => {
        const img: string[] = [];
        img.push(user.profilPhoto);
        this.imagePreloaderService.preloadImages(img).finally(() => {
          this.router.navigateByUrl('preload-stream-app');
        })
      }
    })
  }

  navigateToRegisterPage(): void {
    this.router.navigateByUrl('register');
  }

  navigateToOfflineMode(): void {
    this.router.navigateByUrl('preload-offline-app');
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

}
