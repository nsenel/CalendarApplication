import { Injectable } from '@angular/core';
import { IOwnerSettingsService } from './owner-settings.service.interface';
import { CalendarMappingService, CalendarSetting } from 'src/app/common/models/calendar-settings-model/calendar-settings.model';
import { User, UserInfo, UserType } from 'src/app/common/components/user/models/user/user.model';
import { supabase } from 'src/app/common/superbase/base-client';
import { ITenantService } from 'src/app/common/sevices/tenant-service/tenant.service.interface';

@Injectable({
  providedIn: 'root'
})
export class OwnerSettingsService implements IOwnerSettingsService {

  constructor(private tenantService: ITenantService, private calendarMappingService: CalendarMappingService) { }

  getAllUsers(): Promise<UserInfo[]> {
    return this.fetchUsers();
  }

  createCalendar(userID: string): Promise<boolean> {
    const newCalendar: CalendarSetting = {
      id: crypto.randomUUID(),
      title: "New Calendar",
      accessLevel: UserType.REGULAR as number,
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
    return this.insertNewSettings(newCalendar);
  }

  editCalendarAssignment(calendarID: string, userID: string): Promise<boolean> {
    return this.updateCalendarOwner(calendarID, userID);
  }

  deleteCalendar(calendarID: string): Promise<boolean> {
    return this.removeCalendar(calendarID);
  }


  // --- Real backend function implementations 'Supabase' ---

  private async fetchUsers(): Promise<UserInfo[]> {
    const { data, error } = await supabase
      .from('user_info')
      .select('*')
    if (!error) {
      return Promise.resolve(data.map((userInfo) => User.supabaseUserInfo(userInfo)));
    }
    else {
      return Promise.reject(new Error("Can't receive tenant users"))
    }
  }

  private async insertNewSettings(newCalendar: CalendarSetting): Promise<boolean> {
    const { data, error } = await supabase
      .from('calendar_settings')
      .insert([this.calendarMappingService.toDbModel(newCalendar)]);
    if (error) {
      console.error('Error creating calendar:', error);
      return Promise.reject(new Error('Error creating calendar: ' + error.message));
    }
    return Promise.resolve(true);
  }

  private async updateCalendarOwner(calendarID: string, userID: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('calendar_settings')
        .update({ calendar_owner: userID })
        .eq('calendar_id', calendarID).single()
      if (error) throw error;
    } catch (error) {
      console.error('Error updating calendar owner:', error);
      return Promise.reject(new Error('Error occurred in updating calendar owner'));
    }
    return Promise.resolve(true);
  }

  private async removeCalendar(calendarID: string) {
    try {
      const { error } = await supabase.from('calendar_settings').delete().eq("calendar_id", calendarID).single();
      if (error) throw error;
    } catch (error) {
      console.log("Error in delete calendar operation")
      return Promise.reject(new Error('Error occurred in delete calendar'));
    }
    return Promise.resolve(true);
  }
}
