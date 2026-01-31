import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditListSeasonComponent } from './edit-list-season.component';

describe('EditListSeasonComponent', () => {
  let component: EditListSeasonComponent;
  let fixture: ComponentFixture<EditListSeasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditListSeasonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditListSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
