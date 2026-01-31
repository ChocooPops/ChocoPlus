import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputCategoriesEditionComponent } from './input-categories-edition.component';

describe('InputCategoriesEditionComponent', () => {
  let component: InputCategoriesEditionComponent;
  let fixture: ComponentFixture<InputCategoriesEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputCategoriesEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputCategoriesEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
