import { TestBed } from '@angular/core/testing';

import { EditNewsVideoRunningService } from './edit-news-video-running.service';

describe('EditNewsVideoRunningService', () => {
  let service: EditNewsVideoRunningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditNewsVideoRunningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
