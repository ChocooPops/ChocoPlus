import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPosterLoadingComponent } from './staff-poster-loading.component';

describe('StaffPosterLoadingComponent', () => {
  let component: StaffPosterLoadingComponent;
  let fixture: ComponentFixture<StaffPosterLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffPosterLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffPosterLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
