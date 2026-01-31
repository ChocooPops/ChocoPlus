import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputResearchCategoryComponent } from './input-research-category.component';

describe('InputResearchCategoryComponent', () => {
  let component: InputResearchCategoryComponent;
  let fixture: ComponentFixture<InputResearchCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputResearchCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputResearchCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
