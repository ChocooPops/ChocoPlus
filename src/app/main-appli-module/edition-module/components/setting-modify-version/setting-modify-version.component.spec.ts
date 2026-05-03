import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifyVersionComponent } from './setting-modify-version.component';

describe('SettingModifyVersionComponent', () => {
  let component: SettingModifyVersionComponent;
  let fixture: ComponentFixture<SettingModifyVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyVersionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifyVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
