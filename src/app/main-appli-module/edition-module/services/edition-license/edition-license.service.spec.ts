import { TestBed } from '@angular/core/testing';

import { EditionLicenseService } from './edition-license.service';

describe('EditionLicenseService', () => {
  let service: EditionLicenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditionLicenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
