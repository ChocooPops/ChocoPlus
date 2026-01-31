import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingAddSeriesComponent } from './setting-add-series.component';

describe('SettingAddSeriesComponent', () => {
  let component: SettingAddSeriesComponent;
  let fixture: ComponentFixture<SettingAddSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingAddSeriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingAddSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
