import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifySelectionComponent } from './setting-modify-selection.component';

describe('SettingModifyLicenseComponent', () => {
  let component: SettingModifySelectionComponent;
  let fixture: ComponentFixture<SettingModifySelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifySelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
