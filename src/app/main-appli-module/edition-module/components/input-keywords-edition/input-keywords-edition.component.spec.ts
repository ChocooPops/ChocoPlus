import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputKeywordsEditionComponent } from './input-keywords-edition.component';

describe('InputKeywordsEditionComponent', () => {
  let component: InputKeywordsEditionComponent;
  let fixture: ComponentFixture<InputKeywordsEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputKeywordsEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputKeywordsEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
