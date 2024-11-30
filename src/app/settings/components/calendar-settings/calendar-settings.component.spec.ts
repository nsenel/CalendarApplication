import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarSettingsComponent } from './calendar-settings.component';

describe('CalendarSettingsComponent', () => {
  let component: CalendarSettingsComponent;
  let fixture: ComponentFixture<CalendarSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalendarSettingsComponent]
    });
    fixture = TestBed.createComponent(CalendarSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
