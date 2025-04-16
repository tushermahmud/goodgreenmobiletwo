import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessPaymentsComponent } from './process-payments.component';

describe('ProcessPaymentsComponent', () => {
  let component: ProcessPaymentsComponent;
  let fixture: ComponentFixture<ProcessPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
