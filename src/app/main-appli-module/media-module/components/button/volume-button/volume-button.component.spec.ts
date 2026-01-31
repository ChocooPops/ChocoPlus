import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeButtonComponent } from './volume-button.component';

describe('VolumeButtonComponent', () => {
  let component: VolumeButtonComponent;
  let fixture: ComponentFixture<VolumeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumeButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolumeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
