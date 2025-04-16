import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAddendumComponent } from './add-addendum.component';

describe('AddAddendumComponent', () => {
  let component: AddAddendumComponent;
  let fixture: ComponentFixture<AddAddendumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAddendumComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAddendumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
