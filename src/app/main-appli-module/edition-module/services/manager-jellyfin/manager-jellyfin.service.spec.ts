import { TestBed } from '@angular/core/testing';

import { ManagerJellyfinService } from './manager-jellyfin.service';

describe('ManagerJellyfinService', () => {
  let service: ManagerJellyfinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerJellyfinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
