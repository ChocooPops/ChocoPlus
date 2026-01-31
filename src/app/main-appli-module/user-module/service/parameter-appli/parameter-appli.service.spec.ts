import { TestBed } from '@angular/core/testing';
import { ParameterAppliService } from './parameter-appli.service';

describe('ParameterAppliService', () => {
  let service: ParameterAppliService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParameterAppliService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
