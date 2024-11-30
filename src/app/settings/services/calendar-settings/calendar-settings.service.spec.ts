import { TestBed } from '@angular/core/testing';
import { CalendarSettingsService } from './calendar-settings.service';


describe('CalendarSettingsService', () => {
  let service: CalendarSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
