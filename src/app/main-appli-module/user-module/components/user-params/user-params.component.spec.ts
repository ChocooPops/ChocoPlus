import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserParamsComponent } from './user-params.component';

describe('UserParamsComponent', () => {
  let component: UserParamsComponent;
  let fixture: ComponentFixture<UserParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserParamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
