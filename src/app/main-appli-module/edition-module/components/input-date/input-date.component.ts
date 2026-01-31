import { Component, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-date',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input-date.component.html',
  styleUrl: './input-date.component.css'
})
export class InputDateComponent {

  @Input()
  date !: Date;

  @Output()
  onInputChange = new EventEmitter<Date>();

  formGroup!: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.setFormGroup();
    this.loadFormGroup();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['date']) {
      if (this.formGroup) {
        this.formGroup.get('inputValue')?.setValue(new Date(this.date).toISOString().split('T')[0]);
      }
    }
  }

  private loadFormGroup(): void {
    this.formGroup.get('inputValue')?.valueChanges.subscribe(value => {
      this.onInputChange.emit(value);
    });
  }

  private setFormGroup(): void {
    this.formGroup = this.fb.group({
      inputValue: [new Date(this.date).toISOString().split('T')[0]]
    })
  }

}
