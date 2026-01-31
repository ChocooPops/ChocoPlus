import { TestBed } from '@angular/core/testing';

import { LicenseService } from './licence.service';

describe('LicenceButtonService', () => {
  let service: LicenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LicenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
