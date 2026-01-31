import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifyOrderLicenseComponent } from './setting-modify-order-license.component';

describe('SettingModifyOrderLicenseComponent', () => {
  let component: SettingModifyOrderLicenseComponent;
  let fixture: ComponentFixture<SettingModifyOrderLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyOrderLicenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifyOrderLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
