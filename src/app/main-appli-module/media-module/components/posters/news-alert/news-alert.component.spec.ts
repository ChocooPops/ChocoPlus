import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsAlertComponent } from './news-alert.component';

describe('NewsAlertComponent', () => {
  let component: NewsAlertComponent;
  let fixture: ComponentFixture<NewsAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
