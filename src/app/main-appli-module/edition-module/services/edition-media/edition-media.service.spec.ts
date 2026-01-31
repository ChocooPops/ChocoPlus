import { TestBed } from '@angular/core/testing';

import { EditionMediaService } from './edition-media.service';

describe('EditionMediaService', () => {
  let service: EditionMediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditionMediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
