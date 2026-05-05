import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangOption } from '../../../../../common-module/models/lang_option.interface';
import { SupportedLang } from '../../../../../common-module/models/supported-lang.enum';
import { TranslationLanguageService } from '../../../../../common-module/services/translation-language/translation-language.service';

@Component({
  selector: 'app-lang-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lang-select.component.html',
  styleUrl: './lang-select.component.css'
})
export class LangSelectComponent {

  isOpen = false;

  get langs(): LangOption[]         { return this.translationLanguageService.availableLangs; }
  get current(): SupportedLang      { return this.translationLanguageService.getCurrentLangValue(); }
  get currentOption(): LangOption   { return this.langs.find(l => l.code === this.current)!; }

  constructor(private readonly translationLanguageService: TranslationLanguageService) {}

  toggle(): void  { this.isOpen = !this.isOpen; }
  close(): void   { this.isOpen = false; }

  select(lang: SupportedLang): void {
    this.translationLanguageService.setLang(lang);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.lang-select')) {
      this.close();
    }
  }
  
}