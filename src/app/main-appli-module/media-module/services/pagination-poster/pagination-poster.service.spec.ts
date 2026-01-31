import { TestBed } from '@angular/core/testing';

import { PaginationPosterService } from './pagination-poster.service';

describe('PaginationService', () => {
  let service: PaginationPosterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginationPosterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
