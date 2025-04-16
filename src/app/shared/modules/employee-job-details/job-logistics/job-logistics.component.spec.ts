import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobLogisticsComponent } from './job-logistics.component';

describe('JobLogisticsComponent', () => {
  let component: JobLogisticsComponent;
  let fixture: ComponentFixture<JobLogisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobLogisticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobLogisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
