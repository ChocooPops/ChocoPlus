import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputResearchLicenseComponent } from './input-research-license.component';

describe('InputResearchLicenseComponent', () => {
  let component: InputResearchLicenseComponent;
  let fixture: ComponentFixture<InputResearchLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputResearchLicenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputResearchLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
