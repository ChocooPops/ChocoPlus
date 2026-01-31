import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionLoadingComponent } from './selection-loading.component';

describe('SelectionLoadingComponent', () => {
  let component: SelectionLoadingComponent;
  let fixture: ComponentFixture<SelectionLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
