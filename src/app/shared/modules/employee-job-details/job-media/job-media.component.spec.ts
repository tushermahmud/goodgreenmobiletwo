import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobMediaComponent } from './job-media.component';

describe('JobMediaComponent', () => {
  let component: JobMediaComponent;
  let fixture: ComponentFixture<JobMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
