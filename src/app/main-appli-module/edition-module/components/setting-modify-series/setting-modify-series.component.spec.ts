import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifySeriesComponent } from './setting-modify-series.component';

describe('SettingModifySeriesComponent', () => {
  let component: SettingModifySeriesComponent;
  let fixture: ComponentFixture<SettingModifySeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifySeriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifySeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
