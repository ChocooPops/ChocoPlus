import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-container-word',
  standalone: true,
  imports: [],
  templateUrl: './container-word.component.html',
  styleUrl: './container-word.component.css'
})
export class ContainerWordComponent {

  @Input()
  word !: string;

  @Output()
  removeWordEmit = new EventEmitter<string>();

  removeWord(word: string): void {
    this.removeWordEmit.emit(word);
  }

}
