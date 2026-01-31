import { TestBed } from '@angular/core/testing';

import { UsersManageService } from '../../../../users-manage.service';

describe('UsersManageService', () => {
  let service: UsersManageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersManageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
