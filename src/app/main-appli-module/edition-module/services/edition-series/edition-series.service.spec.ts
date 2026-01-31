import { TestBed } from '@angular/core/testing';

import { EditionSeriesService } from './edition-series.service';

describe('EditionSeriesService', () => {
  let service: EditionSeriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditionSeriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
