import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupLocationComponent } from './pickup-location.component';

describe('PickupLocationComponent', () => {
  let component: PickupLocationComponent;
  let fixture: ComponentFixture<PickupLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickupLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickupLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
