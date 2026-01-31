import { TestBed } from '@angular/core/testing';

import { FormatPosterService } from './format-poster.service';

describe('FormatPosterService', () => {
  let service: FormatPosterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormatPosterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
