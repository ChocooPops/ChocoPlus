import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalPosterComponent } from './horizontal-poster.component';

describe('HorizontalPosterComponent', () => {
  let component: HorizontalPosterComponent;
  let fixture: ComponentFixture<HorizontalPosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalPosterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HorizontalPosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
