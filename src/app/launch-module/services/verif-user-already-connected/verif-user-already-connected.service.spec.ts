import { TestBed } from '@angular/core/testing';
import { VerifUserAlreadyConnectedService } from './verif-user-already-connected.service';

describe('VerifUserAlreadyConnectedService', () => {
  let service: VerifUserAlreadyConnectedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifUserAlreadyConnectedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
