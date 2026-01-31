import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtVolumeComponent } from './bt-volume.component';

describe('BtVolumeComponent', () => {
  let component: BtVolumeComponent;
  let fixture: ComponentFixture<BtVolumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtVolumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
