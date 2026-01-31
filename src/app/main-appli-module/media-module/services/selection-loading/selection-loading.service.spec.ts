import { TestBed } from '@angular/core/testing';

import { SelectionLoadingService } from './selection-loading.service';

describe('SelectionLoadingService', () => {
  let service: SelectionLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectionLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
