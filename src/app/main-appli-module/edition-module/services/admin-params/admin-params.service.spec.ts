import { TestBed } from '@angular/core/testing';

import { AdminParamsService } from './admin-params.service';

describe('AdminParamsService', () => {
  let service: AdminParamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminParamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
