// user-settings.mock.service.ts
import { Injectable } from '@angular/core';
import { IOwnerSettingsService } from './owner-settings.service.interface';
import { mockUsers } from 'src/app/common/components/user/sevices/login/mock.data';
import { UserInfo, UserType } from 'src/app/common/components/user/models/user/user.model';
import { ILoginService } from 'src/app/common/components/user/sevices/login/login.service.interface';
import { mockCalendarSettings } from '../calendar-settings/mock.data';
import { CalendarSetting } from 'src/app/common/models/calendar-settings-model/calendar-settings.model';
import { ITenantService } from 'src/app/common/sevices/tenant-service/tenant.service.interface';

@Injectable({
  providedIn: 'root'
})
export class OwnerSettingsMockService implements IOwnerSettingsService {
  constructor(private userService: ILoginService, private tenantService: ITenantService) { }

  getAllUsers(): Promise<UserInfo[]> {
    if (this.userService.getUserRole() === UserType.PRODUCT_OWNER) {
      const users: UserInfo[] = mockUsers
        .filter(user => this.userService.getCurrentUser()?.tenantID === user.tenantID)
        .map(user => new UserInfo(user.id, user.tenantID, user.username, user.role));

      return Promise.resolve(users);
    }
    return Promise.resolve([]);
  }

  createCalendar(userID: string): Promise<boolean> {
    const newCalendar: CalendarSetting = {
      id: crypto.randomUUID(),
      title: "New Calendar",
      accessLevel: UserType.REGULAR,
      start: '09:00',
      end: '17:00',
      timeIntervalBetweenSlots: '00:30',
      applyLunch: false,
      lunchStart: '10:00',
      lunchEnd: '11:00',
      workingDays: [true, false, true, true, true, false, false],
      calendarOwnerID: userID,
      tenantID: this.tenantService.getTenant(),
      showOnlyWorkingHours: false
    }
    mockCalendarSettings.push(newCalendar)
    return Promise.resolve(true);
  }

  editCalendarAssignment(calendarID: string, userID: string): Promise<boolean> {
    const calendarSettingIndex: number = mockCalendarSettings.findIndex(x => x.id === calendarID && x.tenantID === this.tenantService.getTenant());

    if (calendarSettingIndex >= 0) {
      mockCalendarSettings[calendarSettingIndex].calendarOwnerID = userID;
      return Promise.resolve(true);
    } else {
      return Promise.reject(new Error('Calendar does not exist'));
    }
  }

  deleteCalendar(calendarID: string): Promise<boolean> {
    if (this.tenantService.getTenant()) {
      const calendarSettingIndex: number = mockCalendarSettings.findIndex(x => x.id === calendarID && x.tenantID === this.tenantService.getTenant());

      if (calendarSettingIndex >= 0) {
        mockCalendarSettings.splice(calendarSettingIndex, 1)
        return Promise.resolve(true);
      } else {
        return Promise.reject(new Error('Calendar does not exist'));
      }
    }
    return Promise.reject(new Error('Tenant does not exist'));
  }

}