import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputButtonInfoSeriesComponent } from './input-button-info-series.component';

describe('InputButtonInfoSeriesComponent', () => {
  let component: InputButtonInfoSeriesComponent;
  let fixture: ComponentFixture<InputButtonInfoSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputButtonInfoSeriesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InputButtonInfoSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
