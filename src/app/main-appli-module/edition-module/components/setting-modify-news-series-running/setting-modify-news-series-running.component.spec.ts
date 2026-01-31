import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifyNewsSeriesRunningComponent } from './setting-modify-news-series-running.component';

describe('SettingModifyNewsSeriesRunningComponent', () => {
  let component: SettingModifyNewsSeriesRunningComponent;
  let fixture: ComponentFixture<SettingModifyNewsSeriesRunningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyNewsSeriesRunningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifyNewsSeriesRunningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
