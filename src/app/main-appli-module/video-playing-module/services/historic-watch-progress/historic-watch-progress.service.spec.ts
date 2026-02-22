import { TestBed } from '@angular/core/testing';

import { HistoricWatchProgressService } from './historic-watch-progress.service';

describe('HistoricWatchProgressService', () => {
  let service: HistoricWatchProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoricWatchProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
