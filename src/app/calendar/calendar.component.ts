import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateTime, Duration } from 'luxon';
import { VisBlock } from './models/vis-block-model/vis-block.model';
import { CalandarViewType } from '../common/models/calendar-view-model/calendar-view.model';
import { ICalendarSettingsService } from '../settings/services/calendar-settings/calendar-settings.service.interface';
import { CalendarSetting } from '../common/models/calendar-settings-model/calendar-settings.model';
import { ILoginService } from '../common/components/user/sevices/login/login.service.interface';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy {
  avaibleCalenders: CalendarSetting[] = [];
  currentViewType: CalandarViewType = CalandarViewType.WorkDays;
  selectedDate = DateTime.local();

  visBlocks: Array<VisBlock> = [];
  currentLocale: string = 'en';
  days: DateTime[] = [];
  tileHeight: number = 64;
  calendarSetting: CalendarSetting | undefined;
  viewTypes = Object.values(CalandarViewType);

  private languageSubscription = new Subscription();
  private loginSubscription = new Subscription();
  private weekDays: Record<WeekDay, boolean> = {
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false
  };
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private userService: ILoginService, private calendarSettingsService: ICalendarSettingsService, public translateService: TranslateService) { }

  ngOnInit() {
    this.currentLocale = this.translateService.currentLang;
    this.languageSubscription = this.translateService.onLangChange.subscribe((event) => {
      this.currentLocale = event.lang;
    });
    this.loginSubscription = this.userService.userLogedin$.subscribe((userLogedIn) => { if (userLogedIn) { this.prepareCalendar() } });
    this.prepareCalendar();
  }

  prepareCalendar() {
    this.calendarSettingsService.getCalendarsSettings().then((calendars: CalendarSetting[]) => {
      this.avaibleCalenders = calendars;
      if (calendars.length > 0) {
        this.selectCalendar(this.avaibleCalenders[0].id);
        this.scrollToMiddle();
      }
    }).catch((error) => { console.error('Failed to get calendars', error); });
  }

  scrollToMiddle() {
    if (this.scrollContainer) {
      const container = this.scrollContainer.nativeElement;
      const scrollHeight = container.scrollHeight;
      const containerHeight = container.clientHeight;
      container.scrollTop = (scrollHeight - containerHeight) / 2;
    }
  }

  selectCalendar(calendarID: string) {
    this.calendarSetting = this.avaibleCalenders.find(calendar => calendar.id === calendarID);
    if (this.calendarSetting) {
      const settings = this.calendarSetting;
      const weekDayNames: WeekDay[] = Object.keys(this.weekDays) as WeekDay[];

      if (settings && weekDayNames.length === this.calendarSetting.workingDays.length) {
        weekDayNames.forEach((day, index) => {
          this.weekDays[day] = settings.workingDays[index];
        });
      }
    }

    this.generateDates();
    this.generateBlocks();
  }

  selectViewType(view: CalandarViewType) {
    this.currentViewType = view;
    this.generateDates();
  }

  generateDates() {
    this.days = [];
    if (this.currentViewType === CalandarViewType.Day) {
      this.days.push(this.selectedDate);
    } else if (this.currentViewType === CalandarViewType.WorkDays) {
      const startOfWeek = this.selectedDate.startOf('week');
      for (let i = 0; i < 5; i++) {
        this.days.push(startOfWeek.plus({ days: i }));
      }
    } else if (this.currentViewType === CalandarViewType.Week) {
      const startOfWeek = this.selectedDate.startOf('week');
      for (let i = 0; i < 7; i++) {
        this.days.push(startOfWeek.plus({ days: i }));
      }
    } else {
      const startOfMonth = this.selectedDate.startOf('month');
      const endOfMonth = this.selectedDate.endOf('month');
      for (let i = startOfMonth; i <= endOfMonth; i = i.plus({ days: 1 })) {
        this.days.push(i);
      }
    }
  }

  onDateChange(newDate: DateTime) {
    this.selectedDate = newDate;
    this.generateDates();
  }

  generateBlocks(): void {
    this.visBlocks = [];
    if (!this.calendarSetting) return;

    const timeInterval = Duration.fromObject({ minutes: Number(this.calendarSetting.timeIntervalBetweenSlots.split(':')[1]) });

    if (this.calendarSetting.showOnlyWorkingHours) {
      this.generateWorkingHoursBlocks(timeInterval);
    } else {
      this.generateFullDayBlocks(timeInterval);
    }
  }

  private generateWorkingHoursBlocks(timeInterval: Duration): void {
    if (!this.calendarSetting) return;

    const [startHour, startMinute] = this.calendarSetting.start.split(':').map(Number);
    const [endHour, endMinute] = this.calendarSetting.end.split(':').map(Number);

    const workStartTime = this.selectedDate.set({ hour: startHour, minute: startMinute });
    const workEndTime = this.selectedDate.set({ hour: endHour, minute: endMinute });

    if (this.calendarSetting.applyLunch) {
      const [lunchStartHour, lunchStartMinute] = this.calendarSetting.lunchStart.split(':').map(Number);
      const [lunchEndHour, lunchEndMinute] = this.calendarSetting.lunchEnd.split(':').map(Number);
      const lunchStartTime = this.selectedDate.set({ hour: lunchStartHour, minute: lunchStartMinute });
      const lunchEndTime = this.selectedDate.set({ hour: lunchEndHour, minute: lunchEndMinute });

      const morningDuration = lunchStartTime.diff(workStartTime);
      if (morningDuration.as('minutes') > 0) {
        const morningBlock = new VisBlock(lunchStartTime, morningDuration, this.tileHeight);
        this.visBlocks.push(...morningBlock.splitIntoIntervals(timeInterval));
      }

      const lunchDuration = lunchEndTime.diff(lunchStartTime);
      if (lunchDuration.as('minutes') > 0) {
        const lunchBlock = new VisBlock(lunchEndTime, lunchDuration, this.tileHeight, true);
        this.visBlocks.push(lunchBlock);
      }
      
      const afternoonDuration = workEndTime.diff(lunchEndTime);
      if (afternoonDuration.as('minutes') > 0) {
        const afternoonBlock = new VisBlock(workEndTime, afternoonDuration, this.tileHeight);
        this.visBlocks.push(...afternoonBlock.splitIntoIntervals(timeInterval));
      }

    } else {
      const workingHoursDuration = workEndTime.diff(workStartTime);
      if (workingHoursDuration.as('minutes') > 0) {
        const workingHoursBlock = new VisBlock(workEndTime, workingHoursDuration, this.tileHeight);
        this.visBlocks.push(...workingHoursBlock.splitIntoIntervals(timeInterval));
      }
    }
  }

  private generateFullDayBlocks(timeInterval: Duration): void {
    if (!this.calendarSetting) return;

    const [startHour, startMinute] = this.calendarSetting.start.split(':').map(Number);
    const [endHour, endMinute] = this.calendarSetting.end.split(':').map(Number);

    const dayStart = this.selectedDate.startOf('day');
    const dayEnd = this.selectedDate.endOf('day');
    
    const workStartTime = this.selectedDate.set({ hour: startHour, minute: startMinute });
    const workEndTime = this.selectedDate.set({ hour: endHour, minute: endMinute });

    const beforeWorkDuration = workStartTime.diff(dayStart);
    if(beforeWorkDuration.as('minutes') > 0) {
        const beforeWorkBlock = new VisBlock(workStartTime, beforeWorkDuration, this.tileHeight, true);
        const [firstHalf, secondHalf] = beforeWorkBlock.splitVisBlock();
        this.visBlocks.push(firstHalf, ...secondHalf.splitIntoIntervals(timeInterval));
    }

    this.generateWorkingHoursBlocks(timeInterval);

    const afterWorkDuration = dayEnd.diff(workEndTime);
    if(afterWorkDuration.as('minutes') > 0) {
        const afterWorkBlock = new VisBlock(dayEnd, afterWorkDuration, this.tileHeight, true);
        const [endFirstHalf, endSecondHalf] = afterWorkBlock.splitVisBlock();
        this.visBlocks.push(...endFirstHalf.splitIntoIntervals(timeInterval), endSecondHalf);
    }
  }

  getNumberOfColumns(): number {
    return this.days.length * 2 + 1;
  }

  getFontSize(visBlock: VisBlock): string {
    let fontSize: number = 24;
    if (this.tileHeight < 24) {
      fontSize = (this.tileHeight * 0.75 * 24) / this.tileHeight;
    }
    return visBlock.startTime ? `${fontSize / 2}px` : `${fontSize}px`;
  }

  isDateDisable(day: DateTime): boolean {
    const dayName = day.toFormat('cccc') as WeekDay;
    return !this.weekDays[dayName];
  }

  viewTypeTranslator(value: CalandarViewType): string {
    return this.translateService.instant("CALENDAR.SELECT_VIEW_TYPE_OPTIONS." + value.toUpperCase());
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
    this.loginSubscription.unsubscribe();
  }
}
