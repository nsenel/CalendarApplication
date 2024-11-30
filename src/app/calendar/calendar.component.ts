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
  avaibleCalenders: CalendarSetting[] = []
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

  constructor(private userService: ILoginService, private calendarSettingsService: ICalendarSettingsService, public translateService: TranslateService) {

  }

  ngOnInit() {
    this.currentLocale = this.translateService.currentLang;
    this.languageSubscription = this.translateService.onLangChange.subscribe((event) => {
      this.currentLocale = event.lang;
    });
    this.loginSubscription = this.userService.userLogedin$.subscribe((userLogedIn) => { if (userLogedIn) { this.prepareCalendar() } })
    this.prepareCalendar()
  }

  prepareCalendar() {
    this.calendarSettingsService.getCalendarsSettings().then((calendars: CalendarSetting[]) => {
      this.avaibleCalenders = calendars;
      if (calendars.length > 0) {
        this.selectCalendar(this.avaibleCalenders[0].id);
        this.scrollToMiddle();
      }
    }).catch((error) => { console.error('Failed to get calendars', error); })
  }

  scrollToMiddle() {
    const container = this.scrollContainer.nativeElement;
    const scrollHeight = container.scrollHeight;
    const containerHeight = container.clientHeight;
    // Scroll to the middle of the container
    container.scrollTop = (scrollHeight - containerHeight) / 2;
  }



  // scrollToCurrentTime() {
  //   const currentTimeElement = document.getElementById('current-time-block');
  //   if (currentTimeElement) {
  //     currentTimeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //   }
  // }

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
    }
    else if (this.currentViewType === CalandarViewType.WorkDays) {
      const startOfWeek = this.selectedDate.startOf('week');
      for (let i = 0; i < 5; i++) {
        this.days.push(startOfWeek.plus({ days: i }));
      }
    }
    else if (this.currentViewType === CalandarViewType.Week) {
      const startOfWeek = this.selectedDate.startOf('week');
      for (let i = 0; i < 7; i++) {
        this.days.push(startOfWeek.plus({ days: i }));
      }
    }
    else {
      const startOfMonth = this.selectedDate.startOf('month');
      const endOfMonth = this.selectedDate.endOf('month');
      for (let i = startOfMonth; i < endOfMonth;) {
        this.days.push(i);
        i = i.plus({ days: 1 });
      }
    }
  }

  onDateChange(newDate: DateTime) {
    this.selectedDate = newDate;
    this.generateDates();
  }

  generateBlocks(): void {
    this.visBlocks = [];
    if (this.calendarSetting) {
      const [ofHoursStartsHour, ofHoursStartsMin] = this.calendarSetting.end.split(':').map(Number);
      const [ofHoursEndsHour, ofHoursEndsMin] = this.calendarSetting.start.split(':').map(Number);
      const timeIntervalDay = Duration.fromObject({ minute: Number(this.calendarSetting.timeIntervalBetweenSlots.split(':').map(Number)[1]) })
      const firstBlock = new VisBlock(
        DateTime.fromObject({
          hour: ofHoursEndsHour,
          minute: ofHoursEndsMin,
        }),
        Duration.fromObject({
          hours: ofHoursEndsHour,
          minute: ofHoursEndsMin,
        }),
        this.tileHeight,
        true
      );
      const [firstHalf, secondHalf] = firstBlock.splitVisBlock()
      this.visBlocks.push(firstHalf, ...secondHalf.splitIntoIntervals(timeIntervalDay));
      if (this.calendarSetting.applyLunch) {
        const [lunchStartsHour, lunchStartsMin] = this.calendarSetting.lunchEnd.split(':').map(Number);
        const [lunchEndsHour, lunchEndsMin] = this.calendarSetting.lunchStart.split(':').map(Number);
        const middleBlockUntilLunch = new VisBlock(
          DateTime.fromObject({
            hour: lunchEndsHour,
            minute: lunchEndsMin,
          }),
          Duration.fromObject({
            hours: lunchEndsHour - ofHoursEndsHour,
            minute: lunchEndsMin - ofHoursEndsMin,
          }),
          this.tileHeight
        );
        this.visBlocks.push(
          ...middleBlockUntilLunch.splitIntoIntervals(timeIntervalDay)
        );
        const middleBlockLunch = new VisBlock(
          DateTime.fromObject({
            hour: lunchStartsHour,
            minute: lunchStartsMin,
          }),
          Duration.fromObject({
            hours: lunchStartsHour - lunchEndsHour,
            minute: lunchStartsMin - lunchEndsMin,
          }),
          this.tileHeight,
          true
        );
        this.visBlocks.push(
          middleBlockLunch
        );
        const middleBlockAfterLunch = new VisBlock(
          DateTime.fromObject({
            hour: ofHoursStartsHour,
            minute: ofHoursStartsMin,
          }),
          Duration.fromObject({
            hours: ofHoursStartsHour - lunchStartsHour,
            minute: ofHoursStartsMin - lunchStartsMin,
          }),
          this.tileHeight
        );
        this.visBlocks.push(
          ...middleBlockAfterLunch.splitIntoIntervals(timeIntervalDay)
        );
      }
      else {
        const middleBlock = new VisBlock(
          DateTime.fromObject({
            hour: ofHoursStartsHour,
            minute: ofHoursStartsMin,
          }),
          Duration.fromObject({
            hours: ofHoursStartsHour - ofHoursEndsHour,
            minute: ofHoursStartsMin - ofHoursEndsMin,
          }),
          this.tileHeight
        );
        this.visBlocks.push(
          ...middleBlock.splitIntoIntervals(timeIntervalDay)
        );
      }
      let lastBlock = new VisBlock(
        DateTime.fromObject({ hour: 0 }),
        Duration.fromObject({
          hours: 24 - ofHoursStartsHour - 1,
          minute: 60 - ofHoursStartsMin,
        }),
        this.tileHeight,
        true
      );
      const [endFirstHalf, endSecondHalf] = lastBlock.splitVisBlock()
      this.visBlocks.push(...endFirstHalf.splitIntoIntervals(timeIntervalDay), endSecondHalf);
    }
  }

  getNumberOfColumns(): number {
    return this.days.length * 2 + 1
  }

  // Calculate font size based on tile height
  getFontSize(visBlock: VisBlock): string {
    let fontSize: number = 24;
    if (this.tileHeight < 24) {
      fontSize = (this.tileHeight * 0.75 * 24) / this.tileHeight;
    }
    return visBlock.startTime ? `${fontSize / 2}px` : `${fontSize}px`; // Adjust the divisor based on your preference
  }

  isDateDisable(day: DateTime): boolean {
    const dayName = day.toFormat('cccc') as WeekDay;
    return !this.weekDays[dayName];
  }

  isCurrentTimeBlock(visBlock: VisBlock): boolean {
    const now = DateTime.local().plus({ hour: 3 });
    return now.toFormat('HH:mm:ss') >= visBlock.startTime.toFormat('HH:mm:ss') && now.toFormat('HH:mm:ss') < visBlock.endTime.toFormat('HH:mm:ss');
  }

  viewTypeTranslator(value: CalandarViewType): string {
    return this.translateService.instant("CALENDAR.SELECT_VIEW_TYPE_OPTIONS." + value.toUpperCase());
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
    this.loginSubscription.unsubscribe();
  }
}
