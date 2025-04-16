import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderMediaComponent } from './order-media.component';

describe('OrderMediaComponent', () => {
  let component: OrderMediaComponent;
  let fixture: ComponentFixture<OrderMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
