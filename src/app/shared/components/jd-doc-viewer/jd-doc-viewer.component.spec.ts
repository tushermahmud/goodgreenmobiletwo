import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JdDocViewerComponent } from './jd-doc-viewer.component';

describe('JdDocViewerComponent', () => {
  let component: JdDocViewerComponent;
  let fixture: ComponentFixture<JdDocViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JdDocViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JdDocViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
