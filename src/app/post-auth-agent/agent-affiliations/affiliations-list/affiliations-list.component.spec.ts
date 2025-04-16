import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliationsListComponent } from './affiliations-list.component';

describe('AffiliationsListComponent', () => {
  let component: AffiliationsListComponent;
  let fixture: ComponentFixture<AffiliationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliationsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
