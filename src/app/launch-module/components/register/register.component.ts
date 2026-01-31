import { Component } from '@angular/core';
import { FormPageDirectiveAbstract } from '../form-page.directive';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonFormComponent } from '../button-form/button-form.component';
import { RegisterModel } from '../../models/register.model';
import { MessageReturnedModel } from '../../../common-module/models/message-returned.interface';
import { take } from 'rxjs';
import { OptComponent } from '../opt/opt.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonFormComponent, OptComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css', '../../styles/form.css', '../../styles/input-form.css']
})
export class RegisterComponent extends FormPageDirectiveAbstract {

  placeHolderPseudo: string = 'Pseudo';
  placeHolderFirstName: string = 'Prénom';
  placeHolderLastName: string = 'Nom';
  placeHolderEmail: string = 'Email';

  formControlPseudo: string = 'inputPseudo';
  formControlFirstName: string = 'inputFirstName';
  formControlLastName: string = 'inputLastName';
  formControlDateBorn: string = 'inputDateBorn';
  formControlEmail: string = 'inputEmail';

  private email!: string;
  displayPopup: boolean = false;

  override ngOnInit(): void {
    this.formGroup = this.fb.group({
      inputPseudo: ['', [Validators.required]],
      inputFirstName: ['', [Validators.required]],
      inputLastName: ['', [Validators.required]],
      inputDateBorn: ['', [Validators.required]],
      inputEmail: ['', [Validators.required, Validators.email]]
    })
  }

  override onSubmit(): void {
    if (this.email || this.formGroup.valid) {
      const register: RegisterModel = {
        pseudo: this.formGroup.get(this.formControlPseudo)?.value,
        firstName: this.formGroup.get(this.formControlFirstName)?.value,
        lastName: this.formGroup.get(this.formControlLastName)?.value,
        dateBorn: this.formGroup.get(this.formControlDateBorn)?.value,
        email: this.formGroup.get(this.formControlEmail)?.value
      }
      this.message = 'Chargement ...';
      this.authService.fetchSendVerificationCode(register).pipe(take(1)).subscribe({
        next: (message: MessageReturnedModel) => {
          this.message = message.message;
          if (message.state) {
            this.email = register.email;
            this.displayPopup = true;
          }
        },
        error: () => {
          this.message = 'Aucune connexion'
        }
      })
    } else {
      this.message = 'Formulaire incorrect';
    }
  }

  navigateToLoginPage(): void {
    this.router.navigateByUrl('login');
  }

  onClosePopup(): void {
    this.displayPopup = false;
  }

  onSendNewCode(): void {
    this.message = 'Chargement ...';
    this.authService.fetchReSendVerificationCode(this.email).pipe(take(1)).subscribe((data: MessageReturnedModel) => {
      this.message = data.message;
    })
  }

  onValidate(code: number): void {
    this.message = 'Chargement ...';
    this.authService.fetchValidateVerificationCode(code, this.email).pipe(take(1)).subscribe((data: MessageReturnedModel) => {
      this.message = data.message;
    })
  }

}
