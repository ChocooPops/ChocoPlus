import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbResultsComponent } from './nb-results.component';

describe('NbResultsComponent', () => {
  let component: NbResultsComponent;
  let fixture: ComponentFixture<NbResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NbResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NbResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
