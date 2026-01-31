import { TestBed } from '@angular/core/testing';

import { MediaSelectedService } from './media-selected.service';

describe('MovieSelectedService', () => {
  let service: MediaSelectedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaSelectedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
