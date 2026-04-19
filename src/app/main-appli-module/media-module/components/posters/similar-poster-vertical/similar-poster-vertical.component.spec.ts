import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarPosterVerticalComponent } from './similar-poster-vertical.component';

describe('SimilarPosterVerticalComponent', () => {
  let component: SimilarPosterVerticalComponent;
  let fixture: ComponentFixture<SimilarPosterVerticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimilarPosterVerticalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimilarPosterVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
