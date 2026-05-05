import { TestBed } from '@angular/core/testing';

import { TranslationLanguageService } from './translation-language.service';

describe('TranslationLanguageService', () => {
  let service: TranslationLanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationLanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
