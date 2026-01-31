import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingAddLicenseComponent } from './setting-add-license.component';

describe('SettingAddLicenseComponent', () => {
  let component: SettingAddLicenseComponent;
  let fixture: ComponentFixture<SettingAddLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingAddLicenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingAddLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
