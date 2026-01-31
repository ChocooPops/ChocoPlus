import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalPosterComponent } from './vertical-poster.component';

describe('VerticalPosterComponent', () => {
  let component: VerticalPosterComponent;
  let fixture: ComponentFixture<VerticalPosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalPosterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VerticalPosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
