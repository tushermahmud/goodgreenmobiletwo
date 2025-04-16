import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAuthAgentComponent } from './post-auth-agent.component';

describe('PostAuthAgentComponent', () => {
  let component: PostAuthAgentComponent;
  let fixture: ComponentFixture<PostAuthAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostAuthAgentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAuthAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
