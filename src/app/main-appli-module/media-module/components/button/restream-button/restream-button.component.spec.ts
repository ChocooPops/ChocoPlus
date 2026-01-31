import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestreamButtonComponent } from './restream-button.component';

describe('RestreamButtonComponent', () => {
  let component: RestreamButtonComponent;
  let fixture: ComponentFixture<RestreamButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestreamButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestreamButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
