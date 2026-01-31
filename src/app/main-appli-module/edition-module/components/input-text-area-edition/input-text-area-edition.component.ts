import { Component, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input-text-area-edition',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './input-text-area-edition.component.html',
  styleUrl: './input-text-area-edition.component.css'
})
export class InputTextAreaEditionComponent {

  @Output() onInputChange = new EventEmitter<string>();
  @Input() text: string | undefined = ""
  @Input() placeHolder: string = "Le film se déroule ..."
  @Input() mode: boolean = false;
  @Input() maxLength!: number;

  formGroup!: FormGroup;

  actualLength: number = 0;

  currentClass !: string;
  classMovie: string = 'container-area-movie';
  classSeries: string = 'container-area-series';

  constructor(private fb: FormBuilder) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text']) {
      if (this.formGroup) {
        this.formGroup.get('inputValue')?.setValue(this.text);
      }
    }
  }

  public loadFormGroup(): void {
    this.formGroup.get('inputValue')?.valueChanges.subscribe(value => {
      this.onInputChange.emit(value);
      this.actualLength = value.length;
    });
  }

  ngOnInit(): void {
    if (this.mode) {
      this.currentClass = this.classSeries;
    } else {
      this.currentClass = this.classMovie;
    }
    this.formGroup = this.fb.group({
      inputValue: [this.text],
    });
    if (this.text != undefined) {
      this.actualLength = this.text?.length;
    }
    this.loadFormGroup();
  }

}
