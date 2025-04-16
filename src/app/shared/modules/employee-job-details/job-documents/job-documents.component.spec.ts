import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDocumentsComponent } from './job-documents.component';

describe('JobDocumentsComponent', () => {
  let component: JobDocumentsComponent;
  let fixture: ComponentFixture<JobDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
