import { TestBed } from '@angular/core/testing';

import { MediaStreamingService } from './media-streaming.service';

describe('MediaStreamingService', () => {
  let service: MediaStreamingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaStreamingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
