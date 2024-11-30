import { Component, Input, OnInit } from '@angular/core';
import { DateTime, Duration } from 'luxon';
import { Appointment } from 'src/app/calendar/models/appointment-model/appointment.model';
import { IAppointmentService } from '../../services/appointment-service/appointment.service.interface';
import { AppointmentVis, VisBlock, VisBlockWithAppointment } from '../../models/vis-block-model/vis-block.model';
import { NotificationMessage, NotificationType } from 'src/app/common/components/notification/models/notification/notification.model';
import { catchError, of, switchMap } from 'rxjs';
import { NotificationService } from 'src/app/common/components/notification/sevices/notification/notification.service';

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})
export class DayComponent implements OnInit {
  @Input() day: DateTime = DateTime.now().startOf('day');
  // visBlocks only states the structure do not change it values
  @Input() calendarID: string | undefined = "";
  @Input() visBlocks: Array<VisBlock> = [];
  @Input() tileHeight: number = 18;
  @Input() disableDay: boolean = false;
  visBlocksWithAppointments: Array<VisBlockWithAppointment> = []
  selectedBlock: VisBlockWithAppointment = new VisBlockWithAppointment(0, this.day, Duration.fromObject({ minute: 0 }), this.tileHeight, []);
  selectedAppointment: AppointmentVis | undefined;
  formViewOpen: boolean = false;

  constructor(private appointmentService: IAppointmentService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.visBlocks.forEach((block, index) => {
      let date = this.day;
      date = date.set({ hour: block.endTime.hour, minute: block.endTime.minute });
      let visBlocksWithAppointment = new VisBlockWithAppointment(index, date, block.duration, this.tileHeight, [], this.disableDay ? true : block.dashBlock)
      this.visBlocksWithAppointments.push(visBlocksWithAppointment)
    })
    this.generateAppointmetsView()
  }

  generateAppointmetView(appointment: Appointment) {
    let appointmentVis = new AppointmentVis(appointment, 0, 0, -1);
    let appointmentDuration = appointment.endTime.diff(appointment.startTime);
    let topPadding = 0;
    let totalHeight = 0;
    let skipedUpdate = false;
    const appintmentStartBlockIndex = this.visBlocksWithAppointments.findIndex(block => block.startTime.equals(appointment.startTime) || block.endTime.diff(appointment.startTime).as("minutes") > 0);
    let currentIndex = appintmentStartBlockIndex;
    if (appintmentStartBlockIndex !== -1) {
      let currentBlock = this.visBlocksWithAppointments.at(appintmentStartBlockIndex)
      // Check if appointment need to start below start time
      if (!currentBlock?.startTime.equals(appointment.startTime)) {
        topPadding = (appointment.startTime.diff(currentBlock!.startTime).as("minutes") / currentBlock!.duration.as("minutes")) * currentBlock!.blockHeight
        totalHeight = currentBlock!.blockHeight - topPadding;
        appointmentDuration = appointmentDuration.minus(currentBlock!.endTime.diff(appointment.startTime));
        currentBlock!.addAppointment(appointmentVis)
        skipedUpdate = true;
      }
      while (appointmentDuration.as("minutes") > 0) {
        if (skipedUpdate) {

          skipedUpdate = false;
        }
        else {
          currentBlock!.addAppointment(appointmentVis)
          appointmentDuration = appointmentDuration.minus(currentBlock!.duration);
          totalHeight += currentBlock!.blockHeight;
        }
        currentIndex++;
        currentBlock = this.visBlocksWithAppointments.at(currentIndex);
      }
      if (appointmentDuration.as("minutes") < 0) {
        totalHeight += (appointmentDuration.as("minutes") / currentBlock!.duration.as("minutes")) * currentBlock!.blockHeight
      }
      appointmentVis.visBlockID = this.visBlocksWithAppointments.at(appintmentStartBlockIndex)!.id;
      appointmentVis.viewHeight = totalHeight
      appointmentVis.paddingTopBorder = topPadding
    }


    // let block_idx = this.visBlocksWithAppointments.findIndex(block =>
    //   block.startTime.equals(appointment.startTime) || block.startTime.diff(appointment.startTime).as("minutes") > 0
    // );

    // if (block_idx !== -1) {
    //   let currentBlock = this.visBlocksWithAppointments.at(block_idx);
    //   if (currentBlock && currentBlock.startTime.diff(appointment.startTime).as("minutes") > 0) {
    //     block_idx -= 1;
    //   }
    //   const startBlock = this.visBlocksWithAppointments.at(block_idx);
    //   const startIndex = block_idx;
    //   if (block_idx !== -1 && startBlock) {
    //     let totalDuration = appointment.endTime.diff(appointment.startTime, 'minutes');
    //     currentBlock = this.visBlocksWithAppointments.at(block_idx);
    //     let duration = currentBlock?.duration;
    //     const topPadding = currentBlock ?
    //       (appointment.startTime.diff(currentBlock.startTime).as("minutes") / (duration?.as("minutes") ?? 1)) * currentBlock.blockHeight
    //       : 0;
    //     let teilMultiplyer = 0;
    //     while (currentBlock && duration && totalDuration.as('minutes') > 0 && block_idx < this.visBlocksWithAppointments.length) {
    //       if (block_idx !== startIndex && currentBlock) {
    //         if(!startBlock.occupies.some(block => block.startTime===currentBlock?.startTime))
    //         {
    //           startBlock.occupies.push(currentBlock);
    //         }

    //       }
    //       totalDuration = totalDuration.minus(duration);
    //       if (block_idx === startIndex && topPadding > 0) {
    //         totalDuration= totalDuration.plus(appointment.startTime.diff(currentBlock.startTime))
    //         teilMultiplyer -=(appointment.startTime.diff(currentBlock.startTime).as('minutes') / currentBlock.duration.as("minutes"))
    //       }

    //       teilMultiplyer++;
    //       block_idx++;
    //       currentBlock = this.visBlocksWithAppointments.at(block_idx);
    //       duration = currentBlock?.duration
    //       if(!currentBlock?.occupiedBy.some(appt=>appt.id===appointment.id) && totalDuration.as('minutes') > 0)
    //         {
    //           currentBlock?.occupiedBy.push(appointment);
    //         }
    //     }

    //     if (totalDuration.as('minutes') < 0 && block_idx > 0) {
    //       const previousBlock = this.visBlocksWithAppointments.at(block_idx - 1);
    //       const previousDuration = previousBlock?.duration;
    //       if (previousDuration) {
    //         teilMultiplyer -= (1 + totalDuration.as('minutes') / previousDuration.as("minutes"));
    //       }
    //     }

    //     const appointmentVis = new AppointmentVis(appointment, teilMultiplyer * this.tileHeight, topPadding);
    //     startBlock.appointments.push(appointmentVis);
    //     console.log(appointment.name, "startBlock.occupies:", startBlock.occupies)
    //   }
    // }
  }

  generateAppointmetsView() {
    this.appointmentService.getAppointmentsByDay(this.calendarID!, this.day).subscribe(data => {
      data.forEach((appointment) => this.generateAppointmetView(appointment));
    });
  }

  deleteAppointmentView(appointmentVis: AppointmentVis) {
    this.visBlocksWithAppointments.forEach((visBlock: VisBlockWithAppointment) => {
      if (appointmentVis.includedBlockIDs.has(visBlock.id)) {
        const index = visBlock.appointments.indexOf(appointmentVis);
        if (index !== -1) {
          visBlock.appointments.splice(index, 1);
        }
      }
    });
  }

  handleAppointmentModel(newAppointment: Appointment) {
    const appointmentObservable = this.selectedAppointment
      ? this.appointmentService.editAppointment(newAppointment) // Edit existing appointment
      : this.appointmentService.setAppointment(newAppointment); // Set new appointment

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
      next: appointment => {
        if (appointment) {
          if (this.selectedAppointment !== undefined) {
            this.deleteAppointmentView(this.selectedAppointment);
          }
          this.generateAppointmetView(appointment);
        } else {
          this.notificationService.showNotification(
            new NotificationMessage('Appointment not found', NotificationType.Error, 8000)
          );
        }
      },
      error: err => {
        console.log(err)
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
    console.log("delete", selectedAppointment);
    this.appointmentService.removeAppointment(selectedAppointment).subscribe(
      (res) => {
        this.notificationService.showNotification(
          new NotificationMessage('Appointment deleted successfully',
            NotificationType.Success,
            4000
          )
        );
        this.deleteAppointmentView(selectedAppointment);
      },
      (err) => {
        this.notificationService.showNotification(
          new NotificationMessage(err.message, NotificationType.Error, 8000)
        );
      }
    );

  }
  consoleTime() { console.log("start_time:", " end_time:",) }

  getAppointmentStyles(visBlock: VisBlockWithAppointment, index: number) {
    // let total = 0
    // if (visBlock.occupies.length > 0) {
    //   visBlock.occupies.forEach(block => total = block.appointments.length > total ? block.appointments.length : total)
    // }

    const totalAppointments = visBlock.appointments.length //+ visBlock.occupiedBy.length + total;
    // console.log(visBlock.startTime.toISOTime(), total, visBlock.appointments.length, visBlock.occupiedBy.length)
    const width = 100 / totalAppointments; // Percentage width for each appointment
    const left = width * (index);

    return {
      'width.%': visBlock.appointments[index].width,
      'left.%': visBlock.appointments[index].left,
      'z-index': 6,
      'height.px': visBlock.appointments[index]?.viewHeight ?? this.tileHeight,
      'margin-top.px': visBlock.appointments[index]?.paddingTopBorder ?? 0
    };
  }
  // selectedItems: Set<number> = new Set();
  // selected_range_start!:number;
  // selected_range_end!:number;

  // onMouseDown(at_number:number)
  // {
  //   this.selected_range_start=at_number;
  // }
  // onMouseUp(at_number:number)
  // {
  //   this.selected_range_end=at_number;
  //   this.setSelectedItems(); 
  // }

  // setSelectedItems()
  // {
  //   let num1:number=this.selected_range_start;
  //   let num2:number=this.selected_range_end;
  //   if(this.selected_range_start>this.selected_range_end) {
  //       num1= this.selected_range_end;
  //       num2= this.selected_range_start;
  //     }
  //   // Check each number between num1 and num2
  //   for (let i:number = num1; i <= num2; i++) {
  //     if (this.selectedItems.has(i)) {
  //       this.selectedItems.delete(i); // If the number is in the set, remove it
  //     } else {
  //       this.selectedItems.add(i); // If not, add it to the set
  //     }
  //   }
  //   console.log(this.selectedItems)
  // }

  // isSelected(number: number): boolean {
  //   return this.selectedItems.has(number);
  // }
}
