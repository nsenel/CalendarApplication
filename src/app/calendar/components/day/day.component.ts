import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DateTime, Duration } from 'luxon';
import { Appointment } from 'src/app/calendar/models/appointment-model/appointment.model';
import { IAppointmentService } from '../../services/appointment-service/appointment.service.interface';
import { AppointmentVis, VisBlock, VisBlockWithAppointment } from '../../models/vis-block-model/vis-block.model';
import { NotificationMessage, NotificationType } from 'src/app/common/components/notification/models/notification/notification.model';
import { catchError, of, switchMap } from 'rxjs';
import { NotificationService } from 'src/app/common/components/notification/sevices/notification/notification.service';
import { CalendarLayoutService } from '../../services/calendar-layout/calendar-layout.service';

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})
export class DayComponent implements OnInit, OnChanges {
  @Input() day: DateTime = DateTime.now().startOf('day');
  @Input() calendarID: string | undefined = "";
  @Input() visBlocks: Array<VisBlock> = [];
  @Input() tileHeight: number = 18;
  @Input() disableDay: boolean = false;
  visBlocksWithAppointments: Array<VisBlockWithAppointment> = [];
  selectedBlock: VisBlockWithAppointment = new VisBlockWithAppointment(0, this.day, Duration.fromObject({ minute: 0 }), this.tileHeight, []);
  selectedAppointment: AppointmentVis | undefined;
  formViewOpen: boolean = false;

  constructor(
    private appointmentService: IAppointmentService,
    private notificationService: NotificationService,
    private calendarLayoutService: CalendarLayoutService
  ) { }

  ngOnInit(): void {
    this.fetchAndGenerateLayout();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tileHeight'] || changes['visBlocks']) {
      this.fetchAndGenerateLayout();
    }
  }

  private fetchAndGenerateLayout(): void {
    this.appointmentService.getAppointmentsByDay(this.calendarID!, this.day).subscribe(appointments => {
      this.visBlocksWithAppointments = this.calendarLayoutService.generateDayLayout(
        this.visBlocks,
        appointments,
        this.tileHeight,
        this.day,
        this.disableDay
      );
    });
  }

  handleAppointmentModel(newAppointment: Appointment) {
    const appointmentObservable = this.selectedAppointment
      ? this.appointmentService.editAppointment(newAppointment)
      : this.appointmentService.setAppointment(newAppointment);

    appointmentObservable.pipe(
      switchMap(msg => {
        this.notificationService.showNotification(
          new NotificationMessage(
            this.selectedAppointment ? 'Appointment updated successfully' : 'Appointment set successfully',
            NotificationType.Success,
            4000
          )
        );
        return this.appointmentService.getAppointment(msg);
      }),
      catchError(err => {
        this.notificationService.showNotification(
          new NotificationMessage(err.message, NotificationType.Error, 8000)
        );
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.fetchAndGenerateLayout();
      },
      error: err => {
        console.log(err);
        this.notificationService.showNotification(
          new NotificationMessage('Unexpected error occurred', NotificationType.Error, 8000)
        );
      }
    });
  }

  addAppointment(visBlock: VisBlockWithAppointment): void {
    this.selectedBlock = visBlock;
    this.selectedAppointment = undefined;
    this.formViewOpen = true;
  }

  editAppointment(event: Event, selectedAppointment: AppointmentVis): void {
    event.stopPropagation();
    this.selectedAppointment = selectedAppointment;
    this.formViewOpen = true;
  }

  deleteAppointment(event: Event, selectedAppointment: AppointmentVis) {
    event.stopPropagation();
    this.appointmentService.removeAppointment(selectedAppointment).subscribe(
      () => {
        this.notificationService.showNotification(
          new NotificationMessage('Appointment deleted successfully',
            NotificationType.Success,
            4000
          )
        );
        this.fetchAndGenerateLayout();
      },
      (err) => {
        this.notificationService.showNotification(
          new NotificationMessage(err.message, NotificationType.Error, 8000)
        );
      }
    );
  }

  getAppointmentStyles(visBlock: VisBlockWithAppointment, index: number) {
    const appointment = visBlock.appointments[index];
    return {
      'width.%': appointment.width,
      'left.%': appointment.left,
      'z-index': 6,
      'height.px': appointment.viewHeight,
      'margin-top.px': appointment.paddingTopBorder
    };
  }
}
