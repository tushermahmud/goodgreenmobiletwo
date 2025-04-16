import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeJobDetailsComponent } from './employee-job-details.component';

describe('EmployeeJobDetailsComponent', () => {
  let component: EmployeeJobDetailsComponent;
  let fixture: ComponentFixture<EmployeeJobDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeJobDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeJobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
