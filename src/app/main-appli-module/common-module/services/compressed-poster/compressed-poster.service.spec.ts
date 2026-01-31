import { TestBed } from '@angular/core/testing';

import { CompressedPosterService } from './compressed-poster.service';

describe('CompressedPosterService', () => {
  let service: CompressedPosterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedPosterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
