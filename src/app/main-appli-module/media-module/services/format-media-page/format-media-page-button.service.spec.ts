import { TestBed } from '@angular/core/testing';

import { FormatMediaPageButtonService } from './format-media-page-button.service';

describe('FormatMediaPageButtonService', () => {
  let service: FormatMediaPageButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormatMediaPageButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
