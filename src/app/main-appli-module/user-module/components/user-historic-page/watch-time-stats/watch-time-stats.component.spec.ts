import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchTimeStatsComponent } from './watch-time-stats.component';

describe('WatchTimeStatsComponent', () => {
  let component: WatchTimeStatsComponent;
  let fixture: ComponentFixture<WatchTimeStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchTimeStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchTimeStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
