import { TestBed } from '@angular/core/testing';

import { IeamService } from './ieam.service';

describe('IeamService', () => {
  let service: IeamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IeamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
