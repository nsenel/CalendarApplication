import { Injectable } from "@angular/core"
import { UserType } from "../../components/user/models/user/user.model"

export interface CalendarSetting {
  id: string
  title: string
  accessLevel: UserType
  start: string
  end: string
  timeIntervalBetweenSlots: string
  applyLunch: boolean
  lunchStart: string
  lunchEnd: string
  workingDays: boolean[]
  calendarOwnerID: string
  tenantID?:string
  showOnlyWorkingHours: boolean
}

@Injectable({
  providedIn: 'root'
})
export class CalendarMappingService {

  fromDbModel(dbResult: any): CalendarSetting {
    return {
      id: dbResult.calendar_id,
      title: dbResult.title,
      accessLevel: dbResult.required_access_level,
      start: dbResult.start_time,
      end: dbResult.end_time,
      timeIntervalBetweenSlots: dbResult.time_interval_between_slots,
      applyLunch: dbResult.apply_lunch,
      lunchStart: dbResult.lunch_start,
      lunchEnd: dbResult.lunch_end,
      workingDays: dbResult.working_days,
      calendarOwnerID: dbResult.calendar_owner,
      showOnlyWorkingHours: dbResult.show_only_working_hours
    };
  }

  toDbModel(calendarSetting: CalendarSetting): any {
    return {
      calendar_id: calendarSetting.id,
      title: calendarSetting.title,
      required_access_level: calendarSetting.accessLevel,
      start_time: calendarSetting.start,
      end_time: calendarSetting.end,
      time_interval_between_slots: calendarSetting.timeIntervalBetweenSlots,
      apply_lunch: calendarSetting.applyLunch,
      lunch_start: calendarSetting.lunchStart,
      lunch_end: calendarSetting.lunchEnd,
      working_days: calendarSetting.workingDays,
      calendar_owner: calendarSetting.calendarOwnerID,
      tenant_id:calendarSetting.tenantID,
      show_only_working_hours: calendarSetting.showOnlyWorkingHours
    };
  }
}