import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicensePagesLoadingComponent } from './license-page-loading.component';

describe('LicenseComponentsLoadingComponent', () => {
  let component: LicensePagesLoadingComponent;
  let fixture: ComponentFixture<LicensePagesLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicensePagesLoadingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LicensePagesLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
