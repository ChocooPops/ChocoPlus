import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MylistButtonComponent } from './mylist-button.component';

describe('FavorisButtonComponent', () => {
  let component: MylistButtonComponent;
  let fixture: ComponentFixture<MylistButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MylistButtonComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MylistButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
