import { TestBed } from '@angular/core/testing';

import { OwnerSettingsService } from './owner-settings.service';

describe('OwnerSettingsService', () => {
  let service: OwnerSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OwnerSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
