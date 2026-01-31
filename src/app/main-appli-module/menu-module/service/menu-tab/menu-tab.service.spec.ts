import { TestBed } from '@angular/core/testing';
import { MenuTabService } from './menu-tab.service';

describe('MenuTabService', () => {
  let service: MenuTabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
