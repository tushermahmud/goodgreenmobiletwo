import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDocumentsComponent } from './service-documents.component';

describe('ServiceDocumentsComponent', () => {
  let component: ServiceDocumentsComponent;
  let fixture: ComponentFixture<ServiceDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
