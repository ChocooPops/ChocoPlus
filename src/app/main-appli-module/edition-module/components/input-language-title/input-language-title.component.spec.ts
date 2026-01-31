import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputLanguageTitleComponent } from './input-language-title.component';

describe('InputLanguageTitleComponent', () => {
  let component: InputLanguageTitleComponent;
  let fixture: ComponentFixture<InputLanguageTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputLanguageTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputLanguageTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
