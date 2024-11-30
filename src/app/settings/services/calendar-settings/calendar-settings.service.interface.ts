import { Injectable } from "@angular/core";
import { CalendarSetting } from "src/app/common/models/calendar-settings-model/calendar-settings.model";

@Injectable()
export abstract class ICalendarSettingsService {

    abstract getCalendarsSettings(): Promise<CalendarSetting[]>
    abstract getOwnedCalendarSetting(): Promise<CalendarSetting[]>
    abstract updateCalendarSettings(calenderID: string, newCalendarSettings: CalendarSetting): Promise<CalendarSetting>
}
