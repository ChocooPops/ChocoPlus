import { TestBed } from '@angular/core/testing';
import { EditionSelectionPageService } from './edition-selection-page.service';

describe('EditionSelectionPageService', () => {
  let service: EditionSelectionPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditionSelectionPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
