import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseSelectionComponent } from './license-selection.component';

describe('LicenseSelectionComponent', () => {
  let component: LicenseSelectionComponent;
  let fixture: ComponentFixture<LicenseSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenseSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
