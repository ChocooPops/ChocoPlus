import { TestBed } from '@angular/core/testing';

import { HiddenComponentService } from './hidden-component.service';

describe('HiddenComponentService', () => {
  let service: HiddenComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HiddenComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
