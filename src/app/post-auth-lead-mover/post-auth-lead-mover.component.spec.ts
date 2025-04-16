import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAuthLeadMoverComponent } from './post-auth-lead-mover.component';

describe('PostAuthLeadMoverComponent', () => {
  let component: PostAuthLeadMoverComponent;
  let fixture: ComponentFixture<PostAuthLeadMoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostAuthLeadMoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAuthLeadMoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
