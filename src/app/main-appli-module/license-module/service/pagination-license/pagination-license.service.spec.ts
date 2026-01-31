import { TestBed } from '@angular/core/testing';

import { PaginationLicenseService } from './pagination-license.service';

describe('PaginationLicenseService', () => {
  let service: PaginationLicenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginationLicenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
