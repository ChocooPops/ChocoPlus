import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarPosterComponent } from './similar-poster.component';

describe('SimilarPosterComponent', () => {
  let component: SimilarPosterComponent;
  let fixture: ComponentFixture<SimilarPosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimilarPosterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SimilarPosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
