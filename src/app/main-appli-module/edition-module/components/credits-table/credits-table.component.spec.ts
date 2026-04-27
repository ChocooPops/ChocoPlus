import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsTableComponent } from './credits-table.component';

describe('CreditsTableComponent', () => {
  let component: CreditsTableComponent;
  let fixture: ComponentFixture<CreditsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
