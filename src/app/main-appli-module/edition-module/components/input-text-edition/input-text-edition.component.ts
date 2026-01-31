import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-input-text-edition',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './input-text-edition.component.html',
  styleUrl: './input-text-edition.component.css'
})
export class InputTextEditionComponent {

  @Input()
  placeHolder: string = "";

  @Input()
  type: number = 1;

  @Input()
  text: string | undefined | null = "";

  @Output()
  onInputChange = new EventEmitter<string>();

  @Output()
  onFocus = new EventEmitter<boolean>();

  @Output()
  onBlur = new EventEmitter<boolean>();

  @ViewChild('inputRef') inputElement!: ElementRef<HTMLInputElement>;

  formGroup!: FormGroup;
  constructor(private fb: FormBuilder) { }

  focusIsEnabled(): void {
    this.onFocus.emit(true);
  }

  focusIsDisabled(): void {
    this.onBlur.emit(false);
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      inputValue: [this.text]
    });
    this.loadFormGroup();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text']) {
      if (this.formGroup) {
        this.formGroup.get('inputValue')?.setValue(this.text);
      }
    }
  }

  deleteText(): void {
    this.formGroup = this.fb.group({
      inputValue: ['']
    });
    this.loadFormGroup();
  }

  private loadFormGroup(): void {
    this.formGroup.get('inputValue')?.valueChanges.subscribe(value => {
      this.onInputChange.emit(value);
    });
  }

  public loadTextAlreadyInput(value: string | undefined): void {
    this.text = value;
    this.formGroup = this.fb.group({
      inputValue: [this.text]
    });
    this.loadFormGroup();
  }

  public updateInputValue(newText: string | undefined): void {
    this.text = newText;
    this.formGroup.get('inputValue')?.setValue(this.text);
  }

  public setFocus(): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.focus();
    }
  }

}
