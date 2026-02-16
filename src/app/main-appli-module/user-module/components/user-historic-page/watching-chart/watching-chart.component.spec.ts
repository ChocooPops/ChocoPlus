import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchingChartComponent } from './watching-chart.component';

describe('WatchingChartComponent', () => {
  let component: WatchingChartComponent;
  let fixture: ComponentFixture<WatchingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchingChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
