import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterAppliComponent } from './parameter-appli.component';

describe('ParameterAppliComponent', () => {
  let component: ParameterAppliComponent;
  let fixture: ComponentFixture<ParameterAppliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParameterAppliComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParameterAppliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
