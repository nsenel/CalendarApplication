import { Injectable } from '@angular/core';
import { ICalendarSettingsService } from './calendar-settings.service.interface';
import { CalendarMappingService, CalendarSetting } from 'src/app/common/models/calendar-settings-model/calendar-settings.model';
import { supabase } from 'src/app/common/superbase/base-client';
import { ILoginService } from 'src/app/common/components/user/sevices/login/login.service.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarSettingsService implements ICalendarSettingsService {

  constructor(private userService: ILoginService, private calendarMappingService: CalendarMappingService) { }

  getCalendarsSettings(): Promise<CalendarSetting[]> { return this.fetchCalendarSettings(); }

  // Fetch the calendar settings for the current user
  getOwnedCalendarSetting(): Promise<CalendarSetting[]> {
    return this.fetchOwnedCalendarSetting();
  }

  updateCalendarSettings(calenderID: string, newCalendarSettings: CalendarSetting): Promise<CalendarSetting> {
    return this.updateUserCalendarSettings(calenderID, newCalendarSettings);
  }



  // --- Real backend function implementations 'Supabase' ---

  private async fetchCalendarSettings(): Promise<CalendarSetting[]> {
    const currentUser = this.userService.getCurrentUser();
    var tenantId = "14d29f22-d15d-45e3-83ed-bd932c4028f6" // TODO this should come from link maybe or from user?
    if (currentUser) {
      tenantId = currentUser.tenantID;
      console.log("user tenant", tenantId)
    }
    const { data, error } = await supabase
      .rpc('get_calendar_settings', { p_tenant_id: tenantId }) as { data: any[] | null, error: any };
    if (data) { return data.map(calendarSetting => this.calendarMappingService.fromDbModel(calendarSetting)); }
    else {
      console.error('Error fetching calendar settings:', error);
      return Promise.reject(new Error('Error fetching calendar settings:' + error))
    }
  }

  private async fetchOwnedCalendarSetting(): Promise<CalendarSetting[]> {
    const currentUser = this.userService.getCurrentUser();
    const { data, error } = await supabase
      .from('calendar_settings').select('*')
      .eq("calendar_owner", currentUser?.id ?? "")
    if (error) {
      console.error('Error fetching calendar settings:', error);
      return Promise.reject(new Error('Error fetching calendar settings:' + error));
    }
    return data.map((calendarSetting: any) => this.calendarMappingService.fromDbModel(calendarSetting));

  }

  private async updateUserCalendarSettings(calenderID: string, newCalendarSettings: CalendarSetting): Promise<CalendarSetting> {
    const { data, error } = await supabase
      .from('calendar_settings')
      .update(this.calendarMappingService.toDbModel(newCalendarSettings))
      .eq('calendar_id', calenderID);

    if (error) {
      console.error('Error updating calendar settings:', error);
      return Promise.reject(new Error('Error updating calendar settings:' + error));
    }
    const allCalendarSettings = await this.fetchOwnedCalendarSetting();
    const updatedCalendarSetting = allCalendarSettings.find(setting => setting.id === calenderID);

    if (updatedCalendarSetting) {
      return updatedCalendarSetting;
    } else {
      return Promise.reject(new Error(`Calendar not found after update.`));
    }
  }
}

