import { TestBed } from '@angular/core/testing';

import { SimilarTitleService } from './similar-title.service';

describe('SimilarTitleService', () => {
  let service: SimilarTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimilarTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
