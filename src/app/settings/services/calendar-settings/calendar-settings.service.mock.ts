import { Injectable } from '@angular/core';
import { ICalendarSettingsService } from './calendar-settings.service.interface';
import { CalendarSetting } from 'src/app/common/models/calendar-settings-model/calendar-settings.model';
import { UserType } from 'src/app/common/components/user/models/user/user.model';
import { ILoginService } from 'src/app/common/components/user/sevices/login/login.service.interface';
import { mockCalendarSettings } from './mock.data';
import { ITenantService } from 'src/app/common/sevices/tenant-service/tenant.service.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarSettingsMockService implements ICalendarSettingsService {

  constructor(private userService: ILoginService, private tenantService: ITenantService) { }

  getCalendarsSettings(): Promise<CalendarSetting[]> {
    const userAccessLevel = this.userService.getCurrentUser()?.role ?? 0;
    return Promise.resolve(this.tenantService.getTenant() ? mockCalendarSettings.filter((calendar) => calendar.tenantID === this.tenantService.getTenant() && userAccessLevel >= calendar.accessLevel) : [])
  }

  getOwnedCalendarSetting(): Promise<CalendarSetting[]> {
    const user = this.userService.getCurrentUser()
    const userRole: UserType = this.userService.getUserRole() ?? UserType.VISITOR;
    const calendarSetting: CalendarSetting[] = mockCalendarSettings.filter(
      x => x.calendarOwnerID === user?.id && userRole >= x.accessLevel && user.tenantID === x.tenantID
    );
    if (calendarSetting.length > 0) {
      console.log("getCalendarSetting for calendarID", calendarSetting)
      return Promise.resolve(calendarSetting);
    }
    else {
      return Promise.reject(new Error('Calendar is not exist'));
    }

  }
  updateCalendarSettings(calenderID: string, newCalendarSettings: CalendarSetting): Promise<CalendarSetting> {
    const calendarSettingIndex: number = mockCalendarSettings.findIndex(x => x.id === calenderID);

    if (calendarSettingIndex >= 0) {
      mockCalendarSettings[calendarSettingIndex] = { ...newCalendarSettings };
      return Promise.resolve(mockCalendarSettings[calendarSettingIndex]);
    } else {
      return Promise.reject(new Error('Calendar does not exist'));
    }
  }
}