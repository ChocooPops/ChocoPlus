import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNewsSeriesRunningComponent } from './edit-news-series-running.component';

describe('EditNewsSeriesRunningComponent', () => {
  let component: EditNewsSeriesRunningComponent;
  let fixture: ComponentFixture<EditNewsSeriesRunningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditNewsSeriesRunningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditNewsSeriesRunningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
