import { TestBed } from '@angular/core/testing';

import { FiltersCatalogService } from './filters-catalog.service';

describe('FiltersCatalogService', () => {
  let service: FiltersCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiltersCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
