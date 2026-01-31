import { TestBed } from '@angular/core/testing';

import { EditionSelectionService } from './edition-selection.service';

describe('EditionSelectionService', () => {
  let service: EditionSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditionSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
