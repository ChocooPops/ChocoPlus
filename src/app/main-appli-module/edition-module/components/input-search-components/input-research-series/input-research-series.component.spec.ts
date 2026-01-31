import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputResearchSeriesComponent } from './input-research-series.component';

describe('ButtonSaveComponent', () => {
  let component: InputResearchSeriesComponent;
  let fixture: ComponentFixture<InputResearchSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputResearchSeriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputResearchSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
