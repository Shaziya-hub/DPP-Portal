import { TestBed } from '@angular/core/testing';

import { RejectionModalService } from './rejection-modal-service.service';

describe('RejectionModalServiceService', () => {
  let service: RejectionModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RejectionModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
