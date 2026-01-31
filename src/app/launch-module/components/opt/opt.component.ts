import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-opt',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './opt.component.html',
  styleUrls: ['./opt.component.css']
})
export class OptComponent {

  @Output() validate = new EventEmitter<number>();
  @Output() sendNewCode = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  srcClose: string = 'icon/close.svg';
  otpForm!: FormGroup;
  controls = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];

  constructor(private fb: FormBuilder) {
    this.otpForm = this.fb.group({
      d1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d5: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      d6: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    });
  }

  onInput(event: any, index: number): void {
    const value = event.target.value;

    // Si l'utilisateur tape un chiffre -> focus input suivant
    if (/^[0-9]$/.test(value) && index < 5) {
      const next = document.querySelectorAll('.otp-input')[index + 1] as HTMLElement;
      next.focus();
    }

    // Si entrée invalide -> clear
    if (!/^[0-9]$/.test(value)) {
      event.target.value = '';
      this.otpForm.controls[this.controls[index]].setValue('');
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const inputEls = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;
    const currentInput = inputEls[index];

    if (event.key === 'Backspace') {
      if (currentInput.value) {
        // Si l'input courant contient un chiffre, on le supprime et reste sur la case
        currentInput.value = '';
        const key = `d${index + 1}`;
        this.otpForm.controls[key].setValue('');
        event.preventDefault(); // empêche le comportement par défaut
      } else if (index > 0) {
        // Sinon on va à la case précédente
        inputEls[index - 1].focus();
      }
    }
  }

  // Retourner le code final sous forme de string
  getCode(): number {
    return Number(this.controls.map(c => this.otpForm.controls[c].value).join(''));
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    const digits = pasteData.replace(/\D/g, '').slice(0, 6); // prend max 6 chiffres

    const inputEls = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;

    for (let i = 0; i < digits.length; i++) {
      const key = `d${i + 1}`;
      this.otpForm.controls[key].setValue(digits[i]);
      inputEls[i].value = digits[i];
    }

    // focus sur la case suivante après le dernier chiffre collé
    if (digits.length < 6) {
      inputEls[digits.length].focus();
    } else {
      inputEls[5].focus();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSendNewCode(): void {
    this.sendNewCode.emit();
  }

  onValidateCode(): void {
    this.validate.emit(this.getCode());
  }

}
