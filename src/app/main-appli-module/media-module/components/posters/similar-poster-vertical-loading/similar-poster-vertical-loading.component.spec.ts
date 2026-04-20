import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarPosterVerticalLoadingComponent } from './similar-poster-vertical-loading.component';

describe('SimilarPosterVerticalLoadingComponent', () => {
  let component: SimilarPosterVerticalLoadingComponent;
  let fixture: ComponentFixture<SimilarPosterVerticalLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimilarPosterVerticalLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimilarPosterVerticalLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
