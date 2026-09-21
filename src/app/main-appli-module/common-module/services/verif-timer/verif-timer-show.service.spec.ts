import { TestBed } from '@angular/core/testing';

import { VerifTimerShowService } from './global-formatting.service';

describe('VerifTimerShowService', () => {
  let service: VerifTimerShowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifTimerShowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
