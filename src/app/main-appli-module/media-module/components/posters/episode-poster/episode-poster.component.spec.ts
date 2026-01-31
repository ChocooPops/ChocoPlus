import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodePosterComponent } from './episode-poster.component';

describe('EpisodePosterComponent', () => {
  let component: EpisodePosterComponent;
  let fixture: ComponentFixture<EpisodePosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodePosterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EpisodePosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
