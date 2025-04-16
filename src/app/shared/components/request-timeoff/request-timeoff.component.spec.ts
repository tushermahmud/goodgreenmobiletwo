import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestTimeoffComponent } from './request-timeoff.component';

describe('RequestTimeoffComponent', () => {
  let component: RequestTimeoffComponent;
  let fixture: ComponentFixture<RequestTimeoffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestTimeoffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestTimeoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
