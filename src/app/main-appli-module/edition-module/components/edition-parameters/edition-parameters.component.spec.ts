import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionParametersComponent } from './edition-parameters.component';

describe('EditionParametersComponent', () => {
  let component: EditionParametersComponent;
  let fixture: ComponentFixture<EditionParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditionParametersComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EditionParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
