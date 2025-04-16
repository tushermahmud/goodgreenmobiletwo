import { TestBed } from '@angular/core/testing';

import { GoogleLocationSearchService } from './google-location-search.service';

describe('GoogleLocationSearchService', () => {
  let service: GoogleLocationSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleLocationSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
