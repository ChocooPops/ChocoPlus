import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [NgClass],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css', '../../../common-module/styles/animation.css', '../../../../common-module/styles/loader.css']
})
export class PopupComponent {

  @Input() back: boolean = false;
  @Output() emitActionData = new EventEmitter<any>()
  messages: string[] | undefined = undefined;
  displayPopup: boolean = false;
  displayButton: boolean = false;
  endTask: boolean = false;

  srcImage: string | undefined;
  srcImageSuccess: string = 'icon/success.svg';
  srcImageError: string = 'icon/error.svg';

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.endTask) {
      this.resetPopup();
    }
  }

  onClick(): void {
    if (this.endTask) {
      this.resetPopup();
    }
  }

  onClickPopup(event: MouseEvent): void {
    event.stopPropagation();
  }

  onClickCancel(): void {
    this.displayPopup = false;
    this.endTask = false;
  }

  onClickValidate(): void {
    this.emitActionData.emit();
  }

  public setMessage(message: string | undefined, state: boolean | undefined): void {
    if (message) {
      this.messages = message.split('\n').filter(m => m.trim() !== '');
    } else {
      this.messages = undefined;
    }
    if (state == undefined) {
      this.srcImage = undefined;
    } else if (state) {
      this.srcImage = this.srcImageSuccess;
    } else {
      this.srcImage = this.srcImageError;
    }
  }

  public setDisplayPopup(state: boolean): void {
    this.displayPopup = state;
  }
  public setDisplayButton(state: boolean): void {
    this.displayButton = state;
  }
  public setEndTask(state: boolean): void {
    this.endTask = state;
  }

  public resetPopup(): void {
    this.messages = [];
    this.displayButton = false;
    this.displayPopup = false;
    this.endTask = false;
    this.srcImage = undefined;
  }

}
