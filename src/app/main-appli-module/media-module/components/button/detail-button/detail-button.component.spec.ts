import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailButtonComponent } from './detail-button.component';

describe('DetailButtonComponent', () => {
  let component: DetailButtonComponent;
  let fixture: ComponentFixture<DetailButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
