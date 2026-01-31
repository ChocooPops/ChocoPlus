import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerWordComponent } from './container-word.component';

describe('ContainerWordComponent', () => {
  let component: ContainerWordComponent;
  let fixture: ComponentFixture<ContainerWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerWordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
