import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentServiceMediaComponent } from './agent-service-media.component';

describe('AgentServiceMediaComponent', () => {
  let component: AgentServiceMediaComponent;
  let fixture: ComponentFixture<AgentServiceMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentServiceMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentServiceMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
