import { ChangeDetectionStrategy, Component, HostListener, EventEmitter, Input, OnInit, Output, ElementRef, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import { CalandarViewType } from '../common/models/calendar-view-model/calendar-view.model';

@Component({
  selector: 'app-custom-date-picker',
  templateUrl: './custom-date-picker.component.html',
  styleUrls: ['./custom-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomDatePickerComponent implements OnInit {
  @Input() calandarViewType: CalandarViewType = CalandarViewType.Week;
  @Input() currentLocale: string = "en";
  @Input() selectedDate: DateTime = DateTime.local();
  @Output() selectedDateChange = new EventEmitter<DateTime>();
  @ViewChild('calendarDiv', { static: false }) calendarDiv!: ElementRef;
  showCalendar = false;
  weeks: DateTime[][] = [];

  constructor() {}

  get buttonTitle(): string {
    if (this.calandarViewType === CalandarViewType.Day) { return "Today"; }
    else if (this.calandarViewType === CalandarViewType.Week || this.calandarViewType === CalandarViewType.WorkDays) { return "Current Week"; }
    else if (this.calandarViewType === CalandarViewType.Month) { return "Current Month"; }
    return "Not recognized";
  }
  get formattedDate(): string {
    if (this.calandarViewType === CalandarViewType.Day) { return this.selectedDate.toFormat('MMMM dd, yyyy') }
    else if (this.calandarViewType === CalandarViewType.WorkDays) { return `${this.selectedDate.startOf('week').toFormat('MMMM dd')} - ${this.selectedDate.startOf('week').plus({"day":4}).toFormat('MMMM dd, yyyy')}` }
    else if (this.calandarViewType === CalandarViewType.Week) { return `${this.selectedDate.startOf('week').toFormat('MMMM dd')} - ${this.selectedDate.endOf('week').toFormat('MMMM dd, yyyy')}` }
    else if (this.calandarViewType === CalandarViewType.Month) { return `${this.selectedDate.startOf('month').toFormat('MMMM, yyyy')}` }
    return "Not recognized";
  }

  get weeksInView(): DateTime[][] {
    const startOfMonth = this.selectedDate.startOf('month');
    const endOfMonth = this.selectedDate.endOf('month');
    const weeks = [];
    let startDate = startOfMonth.startOf('week');

    while (startDate <= endOfMonth.endOf('week')) {
      weeks.push(this.getWeekDates(startDate));
      startDate = startDate.plus({ weeks: 1 });
    }
    return weeks;
  }

  private getWeekDates(startDate: DateTime): DateTime[] {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(startDate.plus({ days: i }));
    }
    return week;
  }

  ngOnInit() {
    this.updateCalendar();
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.showCalendar && this.calendarDiv && !this.calendarDiv.nativeElement.contains(event.target)) {
      this.toggleCalendar();
    }
  }

  isShortInputText(): boolean {
    return this.calandarViewType === CalandarViewType.Day || this.calandarViewType === CalandarViewType.Month;
  }

  isDayButtonEnabled(): boolean {
    return this.calandarViewType === CalandarViewType.Day;
  }

  isWeekButtonEnabled(): boolean {
    return this.calandarViewType !== CalandarViewType.Month;
  }

  isMonthButtonEnabled(): boolean {
    return this.calandarViewType !== CalandarViewType.Day;
  }

  prevMonth() {
    this.selectDate(this.selectedDate.minus({ months: 1 }), false);
    this.updateCalendar();
  }

  nextMonth() {
    this.selectDate(this.selectedDate.plus({ months: 1 }), false);
    this.updateCalendar();
  }

  prevWeek() {
    this.selectDate(this.selectedDate.minus({ weeks: 1 }), false);
    this.updateCalendar();
  }

  nextWeek() {
    this.selectDate(this.selectedDate.plus({ weeks: 1 }), false);
    this.updateCalendar();
  }

  prevDay() {
    this.selectDate(this.selectedDate.minus({ day: 1 }), false);
    this.updateCalendar();
  }

  nextDay() {
    this.selectDate(this.selectedDate.plus({ day: 1 }), false);
    this.updateCalendar();
  }

  selectDate(date: DateTime, toggleCalendar: boolean = true) {
    this.selectedDate = date;
    this.selectedDateChange.emit(this.selectedDate); // Emit the selectedDate change to the parent
    if (toggleCalendar) {
      this.toggleCalendar();
    }
  }

  selectToday() {
    this.selectDate(DateTime.local().startOf('day'));
  }

  isSelectedDate(date: DateTime): boolean {
    return date.hasSame(this.selectedDate, 'day');
  }

  isToday(date: DateTime): boolean {
    return date.hasSame(DateTime.local(), 'day');
  }

  isInCurrentMonth(date: DateTime): boolean {
    return date.month === this.selectedDate.month;
  }

  isInSelectedWeek(week: DateTime[]): boolean {
    if (this.calandarViewType === CalandarViewType.WorkDays || this.calandarViewType === CalandarViewType.Week) {
      const selectedWeekStart = this.selectedDate.startOf('week');
      const selectedWeekEnd = this.selectedDate.endOf('week');
      return week.some(date => date >= selectedWeekStart && date <= selectedWeekEnd);
    }
    return false;

  }

  private updateCalendar() {
    this.weeks = this.weeksInView;
  }
}
