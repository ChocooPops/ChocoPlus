import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-input-number-edition',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './input-number-edition.component.html',
  styleUrl: './input-number-edition.component.css',
})
export class InputNumberEditionComponent {
  
  @Input() placeHolder: string = '';
  @Input() number: number | undefined | null;
  @Input() disbaled!: boolean;
  @Output() onInputChange = new EventEmitter<number>();

  formGroup!: FormGroup;
  constructor(private fb: FormBuilder) { }
  
  ngOnInit(): void {
    this.formGroup = this.fb.group({
      inputValue: [this.number]
    });
    this.loadFormGroup();
    if (this.disbaled) {
      this.formGroup.get('inputValue')?.disable();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['number']) {
      if (this.formGroup) {
        this.formGroup.get('inputValue')?.setValue(this.number);
      }
    }
  }

  private loadFormGroup(): void {
    this.formGroup.get('inputValue')?.valueChanges.subscribe(value => {
      this.onInputChange.emit(value);
    });
  }

}
