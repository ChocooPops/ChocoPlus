import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsLoadingComponent } from './news-loading.component';

describe('NewsLoadingComponent', () => {
  let component: NewsLoadingComponent;
  let fixture: ComponentFixture<NewsLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
