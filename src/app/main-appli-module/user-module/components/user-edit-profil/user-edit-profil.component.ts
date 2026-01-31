import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { UserModel } from '../../dto/user.model';
import { UserService } from '../../service/user/user.service';
import { Subscription, take } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EditProfilPictureComponent } from '../edit-profil-picture/edit-profil-picture.component';
import { UpdateUserModel } from '../../dto/update-user.interface';
import { PopupComponent } from '../../../edition-module/components/popup/popup.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { ElectronService } from '../../../../common-module/services/electron/electron.service';
import { AuthService } from '../../../../launch-module/services/auth/auth.service';

@Component({
  selector: 'app-user-edit-profil',
  standalone: true,
  imports: [ReactiveFormsModule, EditProfilPictureComponent, PopupComponent],
  templateUrl: './user-edit-profil.component.html',
  styleUrls: ['./user-edit-profil.component.css', '../../../common-module/styles/animation.css']
})
export class UserEditProfilComponent {

  @ViewChild(PopupComponent) popupRef !: PopupComponent;
  profilPhoto: string | undefined = undefined;
  subscription !: Subscription;
  srcButtonEdit: string = 'icon/edition.svg';

  formGroupInfo !: FormGroup;
  formControlPseudo: string = 'inputPseudo';
  formControlDateBorn: string = 'inputDateBorn';

  formGroupPassWord !: FormGroup;
  formControlCurrentPassWord: string = 'inputCurrentPassWord';
  formControlNewPassWord: string = 'inputNewPassWord';
  formControlReNewPassWord: string = 'inputReNewPassWord';

  displayEditProfilPicture: boolean = false;

  changeUserWhenSubscription!: boolean;
  messageDeleting: string = 'Voulez vraiment supprimer votre compte ? \n Cette opération est définitive.';

  count: number = 0;
  maxCount: number = 5;
  interval: any = null;

  @ViewChild('containerProfilPicture') profilPictureRef!: ElementRef;
  @ViewChild('containerBtProfilPicture') btProfilPictureRef!: ElementRef;

  constructor(private userService: UserService,
    private fb: FormBuilder,
    private electronService: ElectronService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.changeUserWhenSubscription = true;

    this.formGroupInfo = this.fb.group({
      inputPseudo: [''],
      inputDateBorn: ['']
    })

    this.formGroupPassWord = this.fb.group({
      inputCurrentPassWord: [''],
      inputNewPassWord: [''],
      inputReNewPassWord: ['']
    })

    this.subscription = this.userService.getCurrentUser().subscribe((data: UserModel | undefined) => {
      if (data) {
        this.profilPhoto = data.profilPhoto;
        if (this.changeUserWhenSubscription) {
          this.formGroupInfo.get(this.formControlPseudo)?.setValue(data.pseudo);
          this.formGroupInfo.get(this.formControlDateBorn)?.setValue(data.dateBorn.toISOString().split('T')[0]);
          this.changeUserWhenSubscription = false;
        }
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  srcDefaultPp: string = 'pp/pp.jpg';
  errorPpUser(): void {
    if (this.profilPhoto) {
      this.profilPhoto = this.srcDefaultPp;
    }
  }

  onClickProfilPicture(event: Event): void {
    this.displayEditProfilPicture = true;
    event.stopPropagation();
  }

  onClickSave(): void {
    const udpdate: UpdateUserModel = {
      pseudo: this.formGroupInfo.get(this.formControlPseudo)?.value,
      date: this.formGroupInfo.get(this.formControlDateBorn)?.value,
      currentPassWord: this.formGroupPassWord.get(this.formControlCurrentPassWord)?.value,
      newPassWord: this.formGroupPassWord.get(this.formControlNewPassWord)?.value,
      reNewPassWord: this.formGroupPassWord.get(this.formControlReNewPassWord)?.value
    }
    this.popupRef.resetPopup();
    this.popupRef.setDisplayPopup(true);
    this.popupRef.setMessage(undefined, undefined);
    this.userService.fetchUpdateUserByUser(udpdate).pipe(take(1)).subscribe((data: MessageReturnedModel) => {
      this.popupRef.setMessage(data.message, data.state);
      this.popupRef.setEndTask(true);
      if (data.state) {
        this.formGroupPassWord.get(this.formControlCurrentPassWord)?.setValue('');
        this.formGroupPassWord.get(this.formControlNewPassWord)?.setValue('');
        this.formGroupPassWord.get(this.formControlReNewPassWord)?.setValue('');
      }
    })
  }

  onClickCancel(): void {
    this.initForm();
  }

  onClickDelete(): void {
    this.popupRef.resetPopup();
    this.popupRef.setDisplayButton(true);
    this.popupRef.setDisplayPopup(true);
    this.popupRef.setMessage(this.messageDeleting, undefined);
  }

  async onlogout(): Promise<void> {
    this.authService.logout();
    await this.electronService.deleteCacheAndCookies();
    this.electronService.reloadWindow();
  }

  onEmitDelete(): void {
    this.popupRef.setMessage(undefined, undefined);
    this.popupRef.setDisplayButton(false);
    this.userService.fetchDeleteUserByUser().pipe(take(1)).subscribe((data: MessageReturnedModel) => {
      if (data.state) {
        this.popupRef.setMessage(data.message + '\n Déconnexion dans... ' + this.maxCount + 's', data.state);
        this.interval = setInterval(() => {
          this.count++;
          let timeQuit: number = this.maxCount - this.count;
          if (timeQuit < 0) {
            timeQuit = 0;
          }
          this.popupRef.setMessage(data.message + '\n Déconnexion dans... ' + timeQuit + 's', data.state);
          if (this.count > this.maxCount) {
            clearInterval(this.interval);
            this.onlogout();
          }
        }, 1000)
      } else {
        this.popupRef.setMessage(data.message, data.state);
        this.popupRef.setEndTask(true);
      }
    })
  }

  @HostListener('document:click', ['$event'])
  onClickDocument(event: MouseEvent) {
    const clickedInside = this.profilPictureRef?.nativeElement.contains(event.target);
    const clickedInside2 = this.btProfilPictureRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.displayEditProfilPicture = false;
    }
    if (clickedInside2 && this.displayEditProfilPicture) {
      this.displayEditProfilPicture = false
    }
  }

  srcVisible: string = 'icon/visible.svg';
  srcNotVisible: string = 'icon/not-visible.svg';

  srcCurrentMdp: string = this.srcNotVisible;
  srcNewMdp: string = this.srcNotVisible;
  srcReNewMdp: string = this.srcNotVisible;

  typeCurrentMdp: 'password' | 'text' = 'password';
  typeNewMdp: 'password' | 'text' = 'password';
  typeReNewMdp: 'password' | 'text' = 'password';

  onClickCurrentMdp(): void {
    if (this.typeCurrentMdp === "password") {
      this.typeCurrentMdp = "text";
      this.srcCurrentMdp = this.srcVisible;
    } else {
      this.typeCurrentMdp = "password";
      this.srcCurrentMdp = this.srcNotVisible;
    }
  }
  onClickNewMdp(): void {
    if (this.typeNewMdp === "password") {
      this.typeNewMdp = "text";
      this.srcNewMdp = this.srcVisible;
    } else {
      this.typeNewMdp = "password";
      this.srcNewMdp = this.srcNotVisible;
    }
  }
  onClickReNewMdp(): void {
    if (this.typeReNewMdp === "password") {
      this.typeReNewMdp = "text";
      this.srcReNewMdp = this.srcVisible;
    } else {
      this.typeReNewMdp = "password";
      this.srcReNewMdp = this.srcNotVisible;
    }
  }

}
