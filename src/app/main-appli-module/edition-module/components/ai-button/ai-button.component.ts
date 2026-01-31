import { NgClass } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-ai-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './ai-button.component.html',
  styleUrl: './ai-button.component.css'
})
export class AiButtonComponent {

  @Output() clickEmit = new EventEmitter<void>();

  botIsActivate: boolean = false;
  srcAiBot: string = 'icon/bot.svg';

  onClick(): void {
    this.clickEmit.emit();
  }

  changeLoadingActivate(state: boolean): void {
    this.botIsActivate = state;
  }

}
