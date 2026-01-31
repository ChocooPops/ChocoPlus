import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarPosterLoadingComponent } from './similar-poster-loading.component';

describe('SimilarPosterLoadingComponent', () => {
  let component: SimilarPosterLoadingComponent;
  let fixture: ComponentFixture<SimilarPosterLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimilarPosterLoadingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SimilarPosterLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
