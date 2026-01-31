import { TestBed } from '@angular/core/testing';

import { ExecutionVLCService } from './execution-vlc.service';

describe('ExecutionVLCService', () => {
  let service: ExecutionVLCService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExecutionVLCService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
