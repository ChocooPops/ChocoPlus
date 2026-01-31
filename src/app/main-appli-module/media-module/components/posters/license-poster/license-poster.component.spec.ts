import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicensePosterComponent } from './license-poster.component';

describe('LicensePosterComponent', () => {
  let component: LicensePosterComponent;
  let fixture: ComponentFixture<LicensePosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicensePosterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LicensePosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
