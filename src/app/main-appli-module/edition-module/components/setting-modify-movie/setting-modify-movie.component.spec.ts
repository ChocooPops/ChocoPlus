import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifyMovieComponent } from './setting-modify-movie.component';

describe('SettingModifyMovieComponent', () => {
  let component: SettingModifyMovieComponent;
  let fixture: ComponentFixture<SettingModifyMovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyMovieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifyMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
