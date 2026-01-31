import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-input-time-edition',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input-time-edition.component.html',
  styleUrl: './input-time-edition.component.css'
})
export class InputTimeEditionComponent {


  @Input()
  time!: string;

  @Output()
  onInputChange = new EventEmitter<string>();

  formGroup!: FormGroup;
  constructor(private fb: FormBuilder) { }
  ngOnInit(): void {
    this.loadFormGroup();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['time']) {
      if(this.formGroup) {
        this.formGroup.get('inputValue')?.setValue(this.time);
      }
    }
  }

  private loadFormGroup(): void {
    this.formGroup = this.fb.group({
      inputValue: [this.time]
    });
    this.formGroup.get('inputValue')?.valueChanges.subscribe(value => {
      this.onInputChange.emit(value);
    });
  }

  onKeyEvent(event: KeyboardEvent): void {
    if (event.code === 'Backspace' || event.code === 'Delete') {
      this.time = '00:00:00';
      this.onInputChange.emit(this.time);
      this.loadFormGroup();
    }
  }
}
