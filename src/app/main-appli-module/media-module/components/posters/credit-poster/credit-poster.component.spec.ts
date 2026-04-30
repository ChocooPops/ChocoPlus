import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPosterComponent } from './credit-poster.component';

describe('StaffPosterComponent', () => {
  let component: StaffPosterComponent;
  let fixture: ComponentFixture<StaffPosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffPosterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffPosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
