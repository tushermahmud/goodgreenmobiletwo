import { TestBed } from '@angular/core/testing';

import { LeadHelperService } from './lead-helper.service';

describe('LeadHelperService', () => {
  let service: LeadHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeadHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
