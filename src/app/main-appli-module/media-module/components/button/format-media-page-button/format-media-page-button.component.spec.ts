import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatMediaPageButtonComponent } from './format-media-page-button.component';

describe('FormatMediaPageButtonComponent', () => {
  let component: FormatMediaPageButtonComponent;
  let fixture: ComponentFixture<FormatMediaPageButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormatMediaPageButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormatMediaPageButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
