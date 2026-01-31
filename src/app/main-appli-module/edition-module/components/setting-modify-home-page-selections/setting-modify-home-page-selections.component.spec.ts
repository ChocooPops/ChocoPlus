import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingModifyHomePageSelectionsComponent } from './setting-modify-home-page-selections.component';

describe('ModifyHomePageComponent', () => {
  let component: SettingModifyHomePageSelectionsComponent;
  let fixture: ComponentFixture<SettingModifyHomePageSelectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyHomePageSelectionsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SettingModifyHomePageSelectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
