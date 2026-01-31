import { TestBed } from '@angular/core/testing';

import { NewsVideoRunningService } from './news-video-running.service';

describe('NewsVideoRunningService', () => {
  let service: NewsVideoRunningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsVideoRunningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
