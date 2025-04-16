import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropLocationComponent } from './drop-location.component';

describe('DropLocationComponent', () => {
  let component: DropLocationComponent;
  let fixture: ComponentFixture<DropLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
