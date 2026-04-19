import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimilarPosterHorizontalLoadingComponent } from './similar-poster-horizontal-loading.component';


describe('SimilarPosterHorizontalLoadingComponent', () => {
  let component: SimilarPosterHorizontalLoadingComponent;
  let fixture: ComponentFixture<SimilarPosterHorizontalLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimilarPosterHorizontalLoadingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SimilarPosterHorizontalLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
