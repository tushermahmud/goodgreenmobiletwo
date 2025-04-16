import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceRequestDetailComponent } from './service-request-detail.component';

describe('ServiceRequestDetailComponent', () => {
  let component: ServiceRequestDetailComponent;
  let fixture: ComponentFixture<ServiceRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceRequestDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
