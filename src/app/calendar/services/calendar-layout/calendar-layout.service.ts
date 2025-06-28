import { Injectable } from '@angular/core';
import { Appointment } from '../../models/appointment-model/appointment.model';
import { VisBlock, VisBlockWithAppointment, AppointmentVis } from '../../models/vis-block-model/vis-block.model';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class CalendarLayoutService {

  constructor() { }

  public generateDayLayout(
    visBlocks: VisBlock[],
    appointments: Appointment[],
    tileHeight: number,
    day: DateTime,
    disableDay: boolean
  ): VisBlockWithAppointment[] {
    const visBlocksWithAppointments: VisBlockWithAppointment[] = visBlocks.map((block, index) => {
      const date = day.set({ hour: block.endTime.hour, minute: block.endTime.minute });
      return new VisBlockWithAppointment(index, date, block.duration, tileHeight, [], disableDay ? true : block.dashBlock);
    });

    const appointmentVisuals = appointments.map(app => new AppointmentVis(app, 0, 0, -1));

    this.calculateOverlaps(appointmentVisuals);

    appointmentVisuals.forEach(appVis => {
      this.placeAppointmentOnBlocks(appVis, visBlocksWithAppointments);
    });

    return visBlocksWithAppointments;
  }

  private calculateOverlaps(appointments: AppointmentVis[]): void {
    const sortedAppointments = [...appointments].sort((a, b) => {
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      if (a.endTime > b.endTime) return -1;
      if (a.endTime < b.endTime) return 1;
      return 0;
    });

    const collisionGroups: AppointmentVis[][] = [];

    for (const appointment of sortedAppointments) {
      let placed = false;
      for (const group of collisionGroups) {
        const groupEndTime = Math.max(...group.map(a => a.endTime.toMillis()));
        if (appointment.startTime.toMillis() < groupEndTime) {
          group.push(appointment);
          placed = true;
          break;
        }
      }
      if (!placed) {
        collisionGroups.push([appointment]);
      }
    }

    for (const group of collisionGroups) {
      this.layoutGroup(group);
    }
  }

  private layoutGroup(group: AppointmentVis[]): void {
    const columns: AppointmentVis[][] = [];
    group.sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());

    for (const appointment of group) {
      let placedInColumn = false;
      for (const column of columns) {
        const lastInColumn = column[column.length - 1];
        if (lastInColumn.endTime.toMillis() <= appointment.startTime.toMillis()) {
          column.push(appointment);
          appointment.index = columns.indexOf(column);
          placedInColumn = true;
          break;
        }
      }
      if (!placedInColumn) {
        const newColumnIndex = columns.length;
        columns.push([appointment]);
        appointment.index = newColumnIndex;
      }
    }

    const numColumns = columns.length;
    for (const appointment of group) {
      appointment.width = 100 / numColumns;
      appointment.left = appointment.index * appointment.width;
    }
  }

  private placeAppointmentOnBlocks(
    appointmentVis: AppointmentVis,
    visBlocksWithAppointments: VisBlockWithAppointment[]
  ): void {
    const startBlockIndex = visBlocksWithAppointments.findIndex(b =>
      b.startTime <= appointmentVis.startTime && b.endTime > appointmentVis.startTime
    );

    if (startBlockIndex === -1) {
      return; 
    }

    const startBlock = visBlocksWithAppointments[startBlockIndex];

    const topPaddingMinutes = appointmentVis.startTime.diff(startBlock.startTime).as('minutes');
    appointmentVis.paddingTopBorder = (topPaddingMinutes / startBlock.duration.as('minutes')) * startBlock.blockHeight;

    const totalDurationMinutes = appointmentVis.endTime.diff(appointmentVis.startTime).as('minutes');
    const minutesPerPixel = startBlock.duration.as('minutes') / startBlock.blockHeight;
    appointmentVis.viewHeight = totalDurationMinutes / minutesPerPixel;

    appointmentVis.visBlockID = startBlock.id;

    for (const block of visBlocksWithAppointments) {
      if (appointmentVis.startTime < block.endTime && appointmentVis.endTime > block.startTime) {
        block.addAppointment(appointmentVis);
      }
    }
  }
}
