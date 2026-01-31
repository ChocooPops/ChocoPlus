import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosterLoadingComponent } from './poster-loading.component';

describe('PosterLoadingComponent', () => {
  let component: PosterLoadingComponent;
  let fixture: ComponentFixture<PosterLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosterLoadingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PosterLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
