import { UserType } from 'src/app/common/components/user/models/user/user.model';
import { CalendarSetting } from 'src/app/common/models/calendar-settings-model/calendar-settings.model';

// Mock data representing the working hours
export const mockCalendarSettings: CalendarSetting[] = [{
    id: '0',
    title: "Mehmet Eren",
    accessLevel: UserType.REGULAR,
    start: '09:00',
    end: '17:00',
    timeIntervalBetweenSlots: '00:30',
    applyLunch: false,
    lunchStart: '10:00',
    lunchEnd: '11:00',
    workingDays: [true, false, true, true, true, false, false],
    calendarOwnerID: "0",
    tenantID:"0"
},
{
    id: '1',
    title: 'Sevnur',
    accessLevel: UserType.VISITOR,
    start: '06:00',
    end: '17:00',
    timeIntervalBetweenSlots: '00:30',
    applyLunch: true,
    lunchStart: '10:00',
    lunchEnd: '11:00',
    workingDays: [true, false, true, true, true, false, false],
    calendarOwnerID: "1",
    tenantID:"0"
}];