import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingManagerJellyfinComponent } from './setting-manager-jellyfin.component';

describe('SettingManagerJellyfinComponent', () => {
  let component: SettingManagerJellyfinComponent;
  let fixture: ComponentFixture<SettingManagerJellyfinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingManagerJellyfinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingManagerJellyfinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
