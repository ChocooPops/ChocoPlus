import { TestBed } from '@angular/core/testing';

import { GlobalFormattingService } from './global-formatting.service';

describe('GlobalFormattingService', () => {
  let service: GlobalFormattingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalFormattingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
