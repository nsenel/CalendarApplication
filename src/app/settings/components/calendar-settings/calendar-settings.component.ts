import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from 'src/app/common/components/notification/sevices/notification/notification.service';
import { ICalendarSettingsService } from '../../services/calendar-settings/calendar-settings.service.interface';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { NotificationMessage, NotificationType } from 'src/app/common/components/notification/models/notification/notification.model';
import { CalendarSetting } from 'src/app/common/models/calendar-settings-model/calendar-settings.model';
import { UserType } from 'src/app/common/components/user/models/user/user.model';
import { ILoginService } from 'src/app/common/components/user/sevices/login/login.service.interface';
import { CalendarAction, CalendarActionPayload } from '../../models/calendar-action-enum';

@Component({
  selector: 'app-calendar-settings',
  templateUrl: './calendar-settings.component.html',
  styleUrls: ['./calendar-settings.component.scss']
})
export class CalendarSettingsComponent implements OnInit {
  @Input() calendarOwnerAction: CalendarActionPayload | undefined;
  @Output() onCalendarAction = new EventEmitter<CalendarActionPayload>();
  currentUserType: UserType = UserType.VISITOR;
  avaibleCalenders: CalendarSetting[] = [];
  calendarSettings: CalendarSetting | undefined;
  calendarSettingsForm: FormGroup;
  isEditing: boolean = false;
  weekDays = [
    { name: 'Monday', selected: false },
    { name: 'Tuesday', selected: false },
    { name: 'Wednesday', selected: false },
    { name: 'Thursday', selected: false },
    { name: 'Friday', selected: false },
    { name: 'Saturday', selected: false },
    { name: 'Sunday', selected: false }
  ];

  constructor(private fb: FormBuilder, private userService: ILoginService, private calendarSettingsService: ICalendarSettingsService, private notificationService: NotificationService) {
    this.calendarSettingsForm = this.fb.group({
      title: [{ value: undefined, disabled: true }, Validators.required],
      onlyRegisterUserAccess: [{ value: true, disabled: true }, Validators.required],
      showOnlyWorkingHours: [{ value: false, disabled: true }, Validators.required],
      workingHours: this.fb.group({
        start: [{ value: '08:00', disabled: true }, Validators.required],
        end: [{ value: '20:00', disabled: true }, Validators.required],
        timeIntervalBetweenSlots: [{ value: '00:10', disabled: true }, Validators.required],
        applyLunch: [{ value: false, disabled: true }, Validators.required],
        lunchStart: [{ value: '12:00', disabled: true }, Validators.required],
        lunchEnd: [{ value: '13:00', disabled: true }, Validators.required],
      }),
      days: this.fb.array(
        Array(7).fill(null).map(() => this.fb.control({ value: false, disabled: true }))
      )
    });
  }

  ngOnChanges() {
    if (this.calendarOwnerAction) {
      if (this.calendarOwnerAction.action === CalendarAction.ADD || this.calendarOwnerAction.action === CalendarAction.OWNER_CHANGE) {
        this.getCalendarSettings();
      } else if (this.calendarOwnerAction.action === CalendarAction.DELETE) {
        this.avaibleCalenders = this.avaibleCalenders.filter((calendarSetting) => calendarSetting.id !== this.calendarOwnerAction?.calendarID);
      }
    }
  }

  get daysControls(): FormControl[] {
    return this.days.controls as FormControl[];
  }

  ngOnInit(): void {
    this.currentUserType = this.userService.getUserRole() ?? UserType.VISITOR;
    this.getCalendarSettings();
  }

  getCalendarSettings() {
    const getCalendarFuction: Promise<CalendarSetting[]> = this.currentUserType > UserType.ADMIN ? this.calendarSettingsService.getCalendarsSettings() : this.calendarSettingsService.getOwnedCalendarSetting();
    getCalendarFuction.then((calendars) => {
      this.avaibleCalenders = calendars;
      if (this.avaibleCalenders.length > 0) {
        this.calendarSettings = this.avaibleCalenders[0];
        this.patchInitValuesFormValues();
      }
    }).catch((error) => {
      console.error('Failed to load calendar settings', error);
    });
  }

  selectCalendar(selectedCalendarID: string) {
    this.calendarSettings = this.avaibleCalenders.find(calendar => calendar.id === selectedCalendarID);
    this.patchInitValuesFormValues();
  }

  patchInitValuesFormValues() {
    const calendarSettings = this.calendarSettings;
    if (calendarSettings) {
      this.weekDays.forEach((day, index) => {
        if (calendarSettings.workingDays) {
          day.selected = calendarSettings.workingDays[index] ?? false;
        }
      });
      this.calendarSettingsForm.patchValue({
        title: calendarSettings.title,
        id: calendarSettings.id,
        accessLevel: calendarSettings.accessLevel >= UserType.REGULAR ? true : false,
        showOnlyWorkingHours: calendarSettings.showOnlyWorkingHours,
        workingHours: calendarSettings,
        days: this.weekDays.map(day => day.selected)
      });
    }
  }

  get days(): FormArray {
    return this.calendarSettingsForm.get('days') as FormArray;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.calendarSettingsForm.enable();
    } else {
      this.patchInitValuesFormValues();
      this.calendarSettingsForm.disable();
    }
  }

  cancelEdit() {
    this.toggleEdit();
  }

  saveSettings() {
    if (this.calendarSettings && this.calendarSettingsForm.valid) {
      const formValue = this.calendarSettingsForm.value;
      const newCalendarSettings: CalendarSetting = {
        id: this.calendarSettings.id,
        title: formValue.title,
        accessLevel: formValue.onlyRegisterUserAccess ? UserType.REGULAR : UserType.VISITOR,
        start: formValue.workingHours.start,
        end: formValue.workingHours.end,
        timeIntervalBetweenSlots: formValue.workingHours.timeIntervalBetweenSlots,
        applyLunch: formValue.workingHours.applyLunch,
        lunchStart: formValue.workingHours.lunchStart,
        lunchEnd: formValue.workingHours.lunchEnd,
        workingDays: formValue.days,
        calendarOwnerID: this.calendarSettings.calendarOwnerID,
        tenantID: this.calendarSettings.tenantID,
        showOnlyWorkingHours: formValue.showOnlyWorkingHours
      };
      this.calendarSettingsService.updateCalendarSettings(this.calendarSettings.id, newCalendarSettings)
        .then((updatedSettings: CalendarSetting) => {
          const index = this.avaibleCalenders.findIndex(calendar => calendar.id === updatedSettings.id);
          if (index !== -1) {
            this.avaibleCalenders[index] = updatedSettings;
            this.calendarSettings = this.avaibleCalenders[index];
          }
          this.notificationService.showNotification(
            new NotificationMessage('Settings saved successfully!', NotificationType.Success, 4000)
          );
          this.toggleEdit();
          const action: CalendarActionPayload = {
            action: CalendarAction.EDIT,
            calendarID: updatedSettings.id,
            title: updatedSettings.title
          };
          this.onCalendarAction.emit(action);
        })
        .catch((error) => {
          console.error('Failed to save settings:', error);
          this.notificationService.showNotification(
            new NotificationMessage('Failed to save settings. Please try again.', NotificationType.Error, 4000)
          );
        });
    } else {
      this.notificationService.showNotification(
        new NotificationMessage('Please correct the errors in the form before saving.', NotificationType.Info, 4000)
      );
    }
  }
}
