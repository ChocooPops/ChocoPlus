import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingNotFoundComponent } from './setting-not-found.component';

describe('SettingNotFoundComponent', () => {
  let component: SettingNotFoundComponent;
  let fixture: ComponentFixture<SettingNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingNotFoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
