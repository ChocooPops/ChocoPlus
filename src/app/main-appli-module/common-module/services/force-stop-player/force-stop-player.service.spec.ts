import { TestBed } from '@angular/core/testing';

import { ForceStopPlayerService } from './force-stop-player.service';

describe('ForceStopPlayerService', () => {
  let service: ForceStopPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForceStopPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
