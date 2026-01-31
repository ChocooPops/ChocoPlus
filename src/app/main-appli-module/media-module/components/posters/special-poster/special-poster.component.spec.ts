import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialPosterComponent } from './special-poster.component';

describe('SpecialPosterComponent', () => {
  let component: SpecialPosterComponent;
  let fixture: ComponentFixture<SpecialPosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialPosterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SpecialPosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
