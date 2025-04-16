import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoInstructionsComponent } from './video-instructions.component';

describe('VideoInstructionsComponent', () => {
  let component: VideoInstructionsComponent;
  let fixture: ComponentFixture<VideoInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoInstructionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
