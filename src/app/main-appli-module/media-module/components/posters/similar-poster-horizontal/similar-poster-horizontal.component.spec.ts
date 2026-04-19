import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimilarPosterHorizontalComponent } from './similar-poster-horizontal.component';


describe('SimilarPosterHorizontalComponent', () => {
  let component: SimilarPosterHorizontalComponent;
  let fixture: ComponentFixture<SimilarPosterHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimilarPosterHorizontalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SimilarPosterHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
