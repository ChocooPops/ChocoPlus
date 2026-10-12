import { TestBed } from '@angular/core/testing';

import { SoundVideoService } from './sound-video.service';

describe('SoundVideoService', () => {
  let service: SoundVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
