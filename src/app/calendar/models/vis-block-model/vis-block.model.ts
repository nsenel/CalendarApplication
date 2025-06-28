import { DateTime, Duration } from 'luxon';
import { Appointment } from '../appointment-model/appointment.model';

export class VisBlock {
    endTime: DateTime;
    startTime: DateTime;
    duration: Duration;
    dashBlock: boolean;
    blockHeight: number;

    constructor(diplayTitleBottom: DateTime, duration: Duration, blockHeight: number, dashBlock: boolean = false) {
        this.endTime = diplayTitleBottom;
        this.duration = duration;
        this.blockHeight = blockHeight;
        this.startTime = diplayTitleBottom.minus(duration);
        this.dashBlock = dashBlock;
    }

    splitIntoIntervals(intervalDuration: Duration): VisBlock[] {
        const intervalMinutes = intervalDuration.as('minutes');
        const totalMinutes = this.duration.as('minutes');
        const startTime = this.endTime.minus(this.duration);
        const visBlocks: VisBlock[] = [];

        for (let i = 0; i < totalMinutes; i += intervalMinutes) {
            const intervalStartTime = startTime.plus({ minutes: i });
            const intervalEndTime = intervalStartTime.plus(intervalDuration);
            visBlocks.push(new VisBlock(intervalEndTime, intervalDuration, this.blockHeight, this.dashBlock));
        }
        return visBlocks;
    }

    /**
     * Splits the block into two blocks of equal or almost equal duration.
     * The second block will have only full hours if the duration has extra minutes.
     * 
     * @returns {[VisBlock, VisBlock]} - Two VisBlocks split from the original block
     */
    splitVisBlock(): [VisBlock, VisBlock] {
        const totalMinutes = this.duration.as('minutes');
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        const halfHours = Math.floor(totalHours / 2);
        const firstBlockDuration = Duration.fromObject({ hours: halfHours + (totalHours % 2), minutes: remainingMinutes });
        const secondBlockDuration = Duration.fromObject({ hours: halfHours });

        const startTime = this.endTime.minus(this.duration);
        const firstBlockEndTime = startTime.plus(firstBlockDuration);

        const firstBlock = new VisBlock(firstBlockEndTime, firstBlockDuration, this.blockHeight, this.dashBlock);
        const secondBlock = new VisBlock(this.endTime, secondBlockDuration, this.blockHeight, this.dashBlock);
        return [firstBlock, secondBlock];
    }
}

export class VisBlockWithAppointment extends VisBlock {
    id: number;
    appointments: AppointmentVis[];

    constructor(id: number, blockEndTime: DateTime, duration: Duration, blockHeight: number, appointments: AppointmentVis[], dashBlock: boolean = false) {
        super(blockEndTime, duration, blockHeight, dashBlock);
        this.id = id;
        this.appointments = appointments;
    }

    addAppointment(appointmentVis: AppointmentVis) {
        this.appointments.push(appointmentVis);
    }
}

export class AppointmentVis extends Appointment {
    viewHeight: number;
    paddingTopBorder: number;
    visBlockID: number;
    includedBlockIDs: Set<number> = new Set<number>();
    width: number = 100;
    left: number = 0;
    index: number = -1;

    constructor(appointment: Appointment, viewHeight: number, paddingTopBorder: number, visBlockID: number) {
        super(appointment.id, appointment.calendarID, appointment.name, appointment.startTime, appointment.endTime, appointment.message);
        this.viewHeight = viewHeight;
        this.paddingTopBorder = paddingTopBorder;
        this.visBlockID = visBlockID;
    }
}
