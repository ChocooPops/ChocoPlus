import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageRepartitionComponent } from './storage-repartition.component';

describe('StorageRepartitionComponent', () => {
  let component: StorageRepartitionComponent;
  let fixture: ComponentFixture<StorageRepartitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageRepartitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageRepartitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
