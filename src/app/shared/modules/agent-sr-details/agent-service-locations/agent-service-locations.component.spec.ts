import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentServiceLocationsComponent } from './agent-service-locations.component';

describe('AgentServiceLocationsComponent', () => {
  let component: AgentServiceLocationsComponent;
  let fixture: ComponentFixture<AgentServiceLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentServiceLocationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentServiceLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
