import { TestBed } from '@angular/core/testing';

import { CreditsTabService } from './credits-tab.service';

describe('CreditsTabService', () => {
  let service: CreditsTabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditsTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
