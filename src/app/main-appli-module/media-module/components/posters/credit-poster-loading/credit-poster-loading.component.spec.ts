import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditPosterLoadingComponent } from './credit-poster-loading.component';


describe('CreditPosterLoadingComponent', () => {
  let component: CreditPosterLoadingComponent;
  let fixture: ComponentFixture<CreditPosterLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditPosterLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditPosterLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
