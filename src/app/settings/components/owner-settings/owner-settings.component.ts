import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from 'src/app/common/components/notification/sevices/notification/notification.service';
import { ICalendarSettingsService } from '../../services/calendar-settings/calendar-settings.service.interface';
import { NotificationMessage, NotificationType } from 'src/app/common/components/notification/models/notification/notification.model';
import { CalendarSetting } from 'src/app/common/models/calendar-settings-model/calendar-settings.model';
import { UserInfo } from 'src/app/common/components/user/models/user/user.model';
import { ILoginService } from 'src/app/common/components/user/sevices/login/login.service.interface';
import { IOwnerSettingsService } from '../../services/owner-settings/owner-settings.service.interface';
import { CalendarAction, CalendarActionPayload } from '../../models/calendar-action-enum';
import { ModalTypes } from '../../models/modal-types-enum';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ITenantService } from 'src/app/common/sevices/tenant-service/tenant.service.interface';
import { TenantDetails } from 'src/app/common/models/tenant-model/tenant-details.model';

type ModalMessage = { modalType: ModalTypes, title: string, info: string, confirm: Function }
@Component({
  selector: 'app-owner-settings',
  templateUrl: './owner-settings.component.html',
  styleUrls: ['./owner-settings.component.scss']
})
export class OwnerSettingsComponent implements OnInit {
  public ModalTypes = ModalTypes;
  isEditing: boolean = false;
  calendars: CalendarSetting[] = [];
  users: UserInfo[] = [];
  modalMessage: ModalMessage | undefined;
  ownerSettingsForm: FormGroup;
  tenantDetails: TenantDetails | undefined;
  @Input() calendarOwnerAction: CalendarActionPayload | undefined;
  @Output() onCalendarAction = new EventEmitter<CalendarActionPayload>();

  constructor(private fb: FormBuilder, public translateService: TranslateService, private calendarService: ICalendarSettingsService,
    private userService: ILoginService, private ownerSettingsService: IOwnerSettingsService, private tenantService: ITenantService,
    private notificationService: NotificationService) {
    this.ownerSettingsForm = this.fb.group({
      restrictedUserRegistiration: [{ value: true, disabled: true }],
    });
  }

  ngOnInit(): void {
    this.patchInitValuesFormValues();
    this.getCalendars();
    this.getUsers();
  }

  ngOnChanges() {
    if (this.calendarOwnerAction) {
      if (this.calendarOwnerAction.action === CalendarAction.EDIT) {
        const calendarToUpdate = this.calendars.find(
          (calendar) => calendar.id === this.calendarOwnerAction?.calendarID
        );

        if (calendarToUpdate) {
          calendarToUpdate.title = this.calendarOwnerAction.title;
        }
      }
    }
  }

  getCalendars(): void {
    this.calendarService.getCalendarsSettings().then(data => {
      this.calendars = data;
    });

  }

  getUsers(): void {
    this.ownerSettingsService.getAllUsers().then(data => {
      this.users = data;
    });
  }

  patchInitValuesFormValues() {
    const currentTenant = this.tenantService.getTenant();
    if (currentTenant) {
      this.tenantService.getTenantDetails(currentTenant).then((tenantDetails) => {
        this.tenantDetails = tenantDetails ?? undefined;
        this.ownerSettingsForm.patchValue({ restrictedUserRegistiration: tenantDetails?.restrictedUserRegister ?? false })
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.ownerSettingsForm.enable();
    } else {
      this.ownerSettingsForm.disable();
    }
    this.patchInitValuesFormValues();
  }

  cancelEdit() {
    this.toggleEdit();
  }

  saveSettings() {
    if (this.tenantDetails) {
      let tempTenantDetails: TenantDetails = { ...this.tenantDetails }
      tempTenantDetails.restrictedUserRegister = this.ownerSettingsForm.value.restrictedUserRegistiration;
      this.tenantService.updateTenantDetails(tempTenantDetails).then((result: boolean) => {
        if (result) {
          this.tenantDetails = tempTenantDetails
        }
        else {
          console.log("Error updating tenant information")
        }
      })
      this.toggleEdit();
    }


  }

  setModalType(modalType: ModalTypes, calendarId?: string): void {
    if (modalType === ModalTypes.CREATE) {
      this.modalMessage = {
        modalType: ModalTypes.CREATE,
        title: this.translateService.instant("SETTINGS.MANAGEMENT.CREATE"),
        info: this.translateService.instant("SETTINGS.MANAGEMENT.CREATE_MESSAGE"),
        confirm: () => { this.createCalendar(); this.modalMessage = undefined }
      };
    }
    else if (modalType === ModalTypes.DELETE && calendarId) {
      this.modalMessage = {
        modalType: ModalTypes.DELETE,
        title: this.translateService.instant("SETTINGS.MANAGEMENT.DELETE"),
        info: this.translateService.instant("SETTINGS.MANAGEMENT.DELETE_MESSAGE"),
        confirm: () => { this.deleteCalendar(calendarId); this.modalMessage = undefined }
      };
    }
  }

  createCalendar(): void {
    const userID = this.userService.getCurrentUser()?.id;
    if (userID) {
      this.ownerSettingsService.createCalendar(userID).then((result) => {
        const action: CalendarActionPayload = {
          action: CalendarAction.ADD,
          calendarID: Math.random().toString(),
          title: ""
        };
        this.onCalendarAction.emit(action);
        this.getCalendars();
      }).catch((error) => {
        console.error('Failed to create calendar:', error);
        this.notificationService.showNotification(
          new NotificationMessage('Failed to create calendar. Please try again.', NotificationType.Error, 4000)
        );
      });
    }
  }

  deleteCalendar(calendarId: string): void {
    this.ownerSettingsService.deleteCalendar(calendarId).then((result) => {
      if (result) {
        this.calendars = this.calendars.filter(calendar => calendar.id !== calendarId);
        const action: CalendarActionPayload = {
          action: CalendarAction.DELETE,
          calendarID: calendarId,
          title: ""
        };
        this.onCalendarAction.emit(action);
      }
    }).catch((error) => {
      console.error('Failed to delete calendar:', error);
      this.notificationService.showNotification(
        new NotificationMessage('Failed to delete calendar. Please try again.', NotificationType.Error, 4000)
      );
    });
  }

  onOwnerChange(event: Event, calendarId: string): void {
    const target = event.target as HTMLSelectElement;

    if (target && target.value) {
      const newOwnerId = target.value;
      this.ownerSettingsService.editCalendarAssignment(calendarId, newOwnerId).then((result) => {
        if (result) {
          const action: CalendarActionPayload = {
            action: CalendarAction.OWNER_CHANGE,
            calendarID: calendarId,
            title: ""
          };
          this.onCalendarAction.emit(action);
        }
      }).catch((error) => {
        console.error('Failed to change the calendar owner:', error);
        this.notificationService.showNotification(
          new NotificationMessage('Failed to change the calendar owner. Please try again.', NotificationType.Error, 4000)
        );
      });
    } else {
      console.error('Owner selection failed. Target or value is invalid.');
    }
  }
}