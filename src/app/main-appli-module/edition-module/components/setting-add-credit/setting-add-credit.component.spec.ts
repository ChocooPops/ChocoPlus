import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingAddCreditComponent } from './setting-add-credit.component';

describe('SettingAddCreditComponent', () => {
  let component: SettingAddCreditComponent;
  let fixture: ComponentFixture<SettingAddCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingAddCreditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingAddCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
