import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputResearchSelectionComponent } from './input-research-selection.component';

describe('InputResearchLicenseComponent', () => {
  let component: InputResearchSelectionComponent;
  let fixture: ComponentFixture<InputResearchSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputResearchSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputResearchSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
