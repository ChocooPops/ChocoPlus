import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportModel } from '../../dto/support.interface';
import { FormSupportModel } from '../../dto/form-support';
import { Subscription, take } from 'rxjs';
import { SupportService } from '../../service/support/support.service';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { NgClass } from '@angular/common';
import { PopupComponent } from '../../../edition-module/components/popup/popup.component';

@Component({
  selector: 'app-user-support',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, PopupComponent],
  templateUrl: './user-support.component.html',
  styleUrl: './user-support.component.css'
})
export class UserSupportComponent {

  @ViewChild('inputSubject') inputSubject !: ElementRef;
  @ViewChild('inputTheme') inputTheme !: ElementRef;
  @ViewChild(PopupComponent) popupRef !: PopupComponent;

  srcArrow: string = 'icon/arrow.svg';
  formGroup !: FormGroup;
  formControlMessage: string = 'inputMessage';
  maxLength: number = 1000;
  currentLength: number = 0;
  formTab: SupportModel[] = [];
  formThemeTab: string[] = ['', '', ''];

  displaySubject: boolean = false;
  displayTheme: boolean = false;

  currentForm: FormSupportModel = {
    id: 0,
    subject: undefined,
    areaConcerned: undefined,
    description: undefined
  }

  subscription !: Subscription;

  constructor(private fb: FormBuilder,
    private supportService: SupportService
  ) { }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSubjectClick(): void {
    this.displaySubject = true;
  }

  onThemeClick(): void {
    this.displayTheme = true;
  }

  onClickItemSubject(id: number): void {
    const itemClicked: SupportModel | undefined = this.formTab.find((item: SupportModel) => item.id === id);
    if (itemClicked) {
      this.currentForm.subject = itemClicked.subject;
      this.currentForm.areaConcerned = undefined;
      this.formThemeTab = itemClicked.areaConcerned;
      this.displaySubject = false;
    }
  }

  onClickItemTheme(theme: string): void {
    if (theme.trim() !== '') {
      this.currentForm.areaConcerned = theme;
    }
    this.displayTheme = false;
  }

  ngOnInit(): void {
    this.subscription = this.supportService.fetchGetAllFormSupport().pipe(take(1)).subscribe((data: SupportModel[]) => {
      this.formTab = data;
    })

    this.formGroup = this.fb.group({
      inputMessage: ['', [Validators.required]],
    })

    this.formGroup.get(this.formControlMessage)?.valueChanges.subscribe((value: string) => {
      this.currentLength = value.length;
      if (value.length > 0) {
        this.currentForm.description = value;
      } else {
        this.currentForm.description = undefined;
      }
    })
  }

  sendForm(): void {
    this.popupRef.resetPopup();
    this.popupRef.setDisplayPopup(true);
    this.popupRef.setMessage(undefined, undefined);
    this.supportService.fetchSendForm(this.currentForm).pipe(take(1)).subscribe((data: MessageReturnedModel) => {
      this.popupRef.setMessage(data.message, data.state);
      this.popupRef.setEndTask(true);
    })
  }

  resetForm(): void {
    this.currentForm = {
      id: 0,
      subject: undefined,
      areaConcerned: undefined,
      description: undefined
    }
    this.formThemeTab = ['', '', '']
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.inputSubject) {
      const clickInsideSubject: boolean = this.inputSubject.nativeElement.contains(event.target);
      if (!clickInsideSubject) {
        this.displaySubject = false;
      }
    }

    if (this.inputTheme) {
      const clickInsideTheme: boolean = this.inputTheme.nativeElement.contains(event.target);
      if (!clickInsideTheme) {
        this.displayTheme = false;
      }
    }
  }

}
