import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionsListComponent } from './selections-list.component';

describe('SelectionsListComponent', () => {
  let component: SelectionsListComponent;
  let fixture: ComponentFixture<SelectionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
