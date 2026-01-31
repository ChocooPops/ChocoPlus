import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodePosterLoadingComponent } from './episode-poster-loading.component';

describe('EpisodePosterLoadingComponent', () => {
  let component: EpisodePosterLoadingComponent;
  let fixture: ComponentFixture<EpisodePosterLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodePosterLoadingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EpisodePosterLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
