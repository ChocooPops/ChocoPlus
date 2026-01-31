import { TestBed } from '@angular/core/testing';

import { EditionLicenseOrderService } from './edition-license-order.service';

describe('EditionLicenseOrderService', () => {
  let service: EditionLicenseOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditionLicenseOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
