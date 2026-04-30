import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditPosterComponent } from './credit-poster.component';

describe('CreditPosterComponent', () => {
  let component: CreditPosterComponent;
  let fixture: ComponentFixture<CreditPosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditPosterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditPosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
