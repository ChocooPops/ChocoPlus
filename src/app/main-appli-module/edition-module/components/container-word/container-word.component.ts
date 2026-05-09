import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-container-word',
  standalone: true,
  imports: [TranslatePipe],
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
