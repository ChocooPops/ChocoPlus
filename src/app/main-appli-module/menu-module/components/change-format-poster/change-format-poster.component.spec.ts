import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeFormatPosterComponent } from './change-format-poster.component';

describe('ChangeFormatPosterComponent', () => {
  let component: ChangeFormatPosterComponent;
  let fixture: ComponentFixture<ChangeFormatPosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeFormatPosterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeFormatPosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
