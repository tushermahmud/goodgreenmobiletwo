import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentAffiliationsComponent } from './agent-affiliations.component';

describe('AgentAffiliationsComponent', () => {
  let component: AgentAffiliationsComponent;
  let fixture: ComponentFixture<AgentAffiliationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentAffiliationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentAffiliationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
