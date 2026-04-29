import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingModifyCreditComponent } from './setting-modify-credit.component';

describe('SettingModifyCreditComponent', () => {
  let component: SettingModifyCreditComponent;
  let fixture: ComponentFixture<SettingModifyCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingModifyCreditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingModifyCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
