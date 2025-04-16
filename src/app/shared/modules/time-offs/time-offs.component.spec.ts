import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOffsComponent } from './time-offs.component';

describe('TimeOffsComponent', () => {
  let component: TimeOffsComponent;
  let fixture: ComponentFixture<TimeOffsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeOffsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeOffsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
