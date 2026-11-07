import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleGridComponent } from './title-grid.component';

describe('TitleGridComponent', () => {
  let component: TitleGridComponent;
  let fixture: ComponentFixture<TitleGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
