import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewServiceRequestComponent } from './review-service-request.component';

describe('ReviewServiceRequestComponent', () => {
  let component: ReviewServiceRequestComponent;
  let fixture: ComponentFixture<ReviewServiceRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewServiceRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewServiceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
