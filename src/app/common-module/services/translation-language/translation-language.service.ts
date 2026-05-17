import { Injectable } from '@angular/core';
import { LangOption } from '../../models/lang_option.interface';
import { SupportedLang } from '../../models/supported-lang.enum';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationLanguageService {

  readonly availableLangs: LangOption[] = [
    { code: SupportedLang.fr, label: 'Français', flag: '🇫🇷' },
    { code: SupportedLang.en, label: 'English',  flag: '🇬🇧' },
    { code: SupportedLang.ja, label: '日本語',  flag: '🇯🇵' },
  ];

  private currentLang$ = new BehaviorSubject<SupportedLang>(this.getInitialLang());

  private previousLang: SupportedLang | null = null;

  private readonly KEYS_MODE_STORAGE = 'showTranslationKeys';
  private isShowingKeys$ = new BehaviorSubject<boolean>(
    localStorage.getItem(this.KEYS_MODE_STORAGE) === 'true'
  );

  constructor(private readonly translate: TranslateService) {
    this.translate.addLangs(Object.values(SupportedLang));
    this.translate.setDefaultLang('en');

    if (this.isShowingKeys$.value) {
      this.translate.setTranslation('keys', new Proxy({}, {
        get: (_target, key: string) => key
      }));
      this.translate.use('keys' as any);
    } else {
      this.applyLang(this.currentLang$.value);
    }
  }

  getCurrentLang() {
    return this.currentLang$.asObservable();
  }
 
  getIsShowingKeys() {
    return this.isShowingKeys$.asObservable();
  }

  getCurrentLangValue(): SupportedLang {
    return this.currentLang$.value;
  }
 
  getIsShowingKeysValue() {
    return this.isShowingKeys$.value;
  }

  setLang(lang: SupportedLang): void {
    this.hiddeKey();
    if (lang === this.currentLang$.value) return;
    this.previousLang = lang;
    localStorage.setItem('lang', lang);
    this.currentLang$.next(lang);
    this.applyLang(lang);
  }
 
  private applyLang(lang: SupportedLang): void {
    this.translate.use(lang);
  }
 
  private getInitialLang(): SupportedLang {
    const stored = localStorage.getItem('lang') as SupportedLang | null;
    if (stored && Object.values(SupportedLang).includes(stored)) return stored;
 
    const browser = navigator.language.split('-')[0];
    return (Object.values(SupportedLang).includes(browser as SupportedLang) ? browser : 'en') as SupportedLang;
  }

  showTranslationKeys(): void {
    this.translate.setTranslation('keys', new Proxy({}, {
      get: (_target, key: string) => key
    }));
    this.translate.use('keys' as any);
    this.showKey();
  }

  revertToPreviousLang(): void {
    const target = this.previousLang ?? this.getInitialLang();
    this.currentLang$.next(target);
    this.previousLang = target;
    localStorage.setItem('lang', target);
    this.hiddeKey();
    this.applyLang(target);
  }

  private showKey(): void {
    this.isShowingKeys$.next(true);
    localStorage.setItem(this.KEYS_MODE_STORAGE, 'true');
  }

  private hiddeKey(): void {
    localStorage.setItem(this.KEYS_MODE_STORAGE, 'false');
    this.isShowingKeys$.next(false);
  }

}
