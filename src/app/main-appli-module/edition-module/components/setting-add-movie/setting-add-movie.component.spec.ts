import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingAddMovieComponent } from './setting-add-movie.component';

describe('SettingAddMovieComponent', () => {
  let component: SettingAddMovieComponent;
  let fixture: ComponentFixture<SettingAddMovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingAddMovieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingAddMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
