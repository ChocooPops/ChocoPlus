import { TestBed } from '@angular/core/testing';

import { DisplayOrderService } from './display-order.service';

describe('DisplayOrderService', () => {
  let service: DisplayOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplayOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
