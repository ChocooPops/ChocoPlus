import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlateformComponent } from './plateform.component';

describe('PlateformComponent', () => {
  let component: PlateformComponent;
  let fixture: ComponentFixture<PlateformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlateformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlateformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
