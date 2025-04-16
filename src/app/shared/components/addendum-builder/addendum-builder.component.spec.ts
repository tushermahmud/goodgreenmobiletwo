import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddendumBuilderComponent } from './addendum-builder.component';

describe('AddendumBuilderComponent', () => {
  let component: AddendumBuilderComponent;
  let fixture: ComponentFixture<AddendumBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddendumBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddendumBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
