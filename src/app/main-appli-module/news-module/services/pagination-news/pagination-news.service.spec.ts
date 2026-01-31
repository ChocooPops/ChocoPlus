import { TestBed } from '@angular/core/testing';

import { PaginationNewsService } from './pagination-news.service';

describe('PaginationNewsService', () => {
  let service: PaginationNewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginationNewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
