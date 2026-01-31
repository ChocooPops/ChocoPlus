import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifyNewsComponent } from './setting-modify-news.component';

describe('SettingModifyNewsComponent', () => {
  let component: SettingModifyNewsComponent;
  let fixture: ComponentFixture<SettingModifyNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyNewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifyNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
