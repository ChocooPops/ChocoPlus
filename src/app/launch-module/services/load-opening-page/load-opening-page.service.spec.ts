import { TestBed } from '@angular/core/testing';

import { LoadHomepageService } from './load-opening-page.service';

describe('LoadHomepageService', () => {
  let service: LoadHomepageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadHomepageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
