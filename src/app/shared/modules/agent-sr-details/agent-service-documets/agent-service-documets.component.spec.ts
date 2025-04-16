import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentServiceDocumetsComponent } from './agent-service-documets.component';

describe('AgentServiceDocumetsComponent', () => {
  let component: AgentServiceDocumetsComponent;
  let fixture: ComponentFixture<AgentServiceDocumetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentServiceDocumetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentServiceDocumetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
