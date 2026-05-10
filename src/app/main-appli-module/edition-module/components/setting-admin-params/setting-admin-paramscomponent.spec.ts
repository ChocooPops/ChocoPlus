import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingAdminParamsComponent } from './setting-admin-params.component';


describe('SettingAdminParamsComponent', () => {
  let component: SettingAdminParamsComponent;
  let fixture: ComponentFixture<SettingAdminParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingAdminParamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingAdminParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
