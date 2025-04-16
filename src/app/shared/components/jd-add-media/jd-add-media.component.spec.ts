import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JdAddMediaComponent } from './jd-add-media.component';

describe('JdAddMediaComponent', () => {
  let component: JdAddMediaComponent;
  let fixture: ComponentFixture<JdAddMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JdAddMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JdAddMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
