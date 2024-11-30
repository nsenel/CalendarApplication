import { Injectable } from '@angular/core';
import { UserInfo } from 'src/app/common/components/user/models/user/user.model';
import { CalendarSetting } from 'src/app/common/models/calendar-settings-model/calendar-settings.model';

@Injectable()
export abstract class IOwnerSettingsService {
    abstract getAllUsers(): Promise<UserInfo[]>;
    abstract createCalendar(userID: string): Promise<boolean>;
    abstract editCalendarAssignment(calendarID:string, userID:string): Promise<boolean>;
    abstract deleteCalendar(calendarID:string): Promise<boolean>;
}