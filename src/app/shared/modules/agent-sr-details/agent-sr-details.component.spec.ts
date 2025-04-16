import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentSrDetailsComponent } from './agent-sr-details.component';

describe('AgentSrDetailsComponent', () => {
  let component: AgentSrDetailsComponent;
  let fixture: ComponentFixture<AgentSrDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentSrDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentSrDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
