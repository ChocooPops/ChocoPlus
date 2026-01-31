import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifyLicenseComponent } from './setting-modify-license.component';

describe('SettingModifyLicenseComponent', () => {
  let component: SettingModifyLicenseComponent;
  let fixture: ComponentFixture<SettingModifyLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyLicenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifyLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
