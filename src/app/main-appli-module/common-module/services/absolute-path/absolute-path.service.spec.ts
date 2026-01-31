import { TestBed } from '@angular/core/testing';

import { AbsolutePathService } from './absolute-path.service';

describe('AbsolutePathService', () => {
  let service: AbsolutePathService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbsolutePathService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
