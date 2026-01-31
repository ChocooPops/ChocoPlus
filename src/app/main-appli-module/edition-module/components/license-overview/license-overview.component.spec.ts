import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseOverviewComponent } from './license-overview.component';

describe('LicenseOverviewComponent', () => {
  let component: LicenseOverviewComponent;
  let fixture: ComponentFixture<LicenseOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenseOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
