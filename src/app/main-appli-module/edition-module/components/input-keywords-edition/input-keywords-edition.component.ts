import { Component, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { ContainerWordComponent } from '../container-word/container-word.component';
import { ButtonAddComponent } from '../button-add/button-add.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';

@Component({
  selector: 'app-input-keywords-edition',
  standalone: true,
  imports: [ContainerWordComponent, ButtonAddComponent, InputTextEditionComponent],
  templateUrl: './input-keywords-edition.component.html',
  styleUrl: './input-keywords-edition.component.css'
})
export class InputKeywordsEditionComponent {

  @ViewChild(InputTextEditionComponent) childInputText!: InputTextEditionComponent;
  @Input() placeHolder: string = "ex : Mort & Résurrection";
  @Output() onInputChange = new EventEmitter<string[]>()
  @Input() keyWords: string[] = [];

  keyWordInInput: string | undefined;

  onInputKeyWord(keyWord: string): void {
    if (keyWord === "") {
      this.keyWordInInput = undefined;
    } else {
      this.keyWordInInput = keyWord;
    }
  }

  onClick(): void {
    if (this.keyWordInInput != undefined) {
      this.keyWords.push(this.keyWordInInput);
      this.keyWordInInput = undefined;
    }
    this.onInputChange.emit(this.keyWords);
    if (this.childInputText != undefined) {
      this.childInputText.deleteText();
    }
  }

  removeKeyword(keyWords: string): void {
    const index = this.keyWords.findIndex(key => key === keyWords);
    this.keyWords.splice(index, 1);
  }

  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onClick();
    }
  }

}
