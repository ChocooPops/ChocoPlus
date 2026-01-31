import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifyNewsMovieRunningComponent } from './setting-modify-news-movie-running.component';

describe('SettingModifyNewsMovieRunningComponent', () => {
  let component: SettingModifyNewsMovieRunningComponent;
  let fixture: ComponentFixture<SettingModifyNewsMovieRunningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyNewsMovieRunningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifyNewsMovieRunningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
