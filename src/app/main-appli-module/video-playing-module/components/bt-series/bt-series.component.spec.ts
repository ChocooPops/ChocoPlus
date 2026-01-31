import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtSeriesComponent } from './bt-series.component';

describe('BtSeriesComponent', () => {
  let component: BtSeriesComponent;
  let fixture: ComponentFixture<BtSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtSeriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
