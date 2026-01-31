import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuTmpComponent } from './menu-tmp.component';

describe('MenuTmpComponent', () => {
  let component: MenuTmpComponent;
  let fixture: ComponentFixture<MenuTmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTmpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuTmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
