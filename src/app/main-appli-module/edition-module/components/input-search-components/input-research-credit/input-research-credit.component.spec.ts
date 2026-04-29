import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputResearchCreditComponent } from './input-research-credit.component';

describe('InputResearchCreditComponent', () => {
  let component: InputResearchCreditComponent;
  let fixture: ComponentFixture<InputResearchCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputResearchCreditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputResearchCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
