import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentJobCardComponent } from './current-job-card.component';

describe('CurrentJobCardComponent', () => {
  let component: CurrentJobCardComponent;
  let fixture: ComponentFixture<CurrentJobCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentJobCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentJobCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
