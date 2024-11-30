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

        // const lastBlock = visBlocks[visBlocks.length - 1];
        // if (lastBlock && lastBlock.endTime !== this.endTime) {
        //     const adjustedDuration = this.endTime.diff(lastBlock.endTime);
        //     lastBlock.duration = adjustedDuration;
        //     lastBlock.endTime = this.endTime;
        // }
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
    // occupiedBy: Appointment[] = [];
    // occupies: VisBlockWithAppointment[] = [];


    constructor(id: number, blockEndTime: DateTime, duration: Duration, blockHeight: number, appointments: AppointmentVis[], dashBlock: boolean = false) {
        super(blockEndTime, duration, blockHeight, dashBlock);
        this.id = id;
        this.appointments = appointments;
    }
    addAppointment(appointmentVis: AppointmentVis) {
        appointmentVis.includedBlockIDs.add(this.id);
        this.appointments.push(appointmentVis);
    
        if (appointmentVis.index === -1) {
            appointmentVis.index = this.appointments.length - 1;
        }
    
        let fillBefore = false;
        let extraWidth = 0;
        let leftOffset = 0;
        const width = 100 / this.appointments.length;
    
        this.appointments.forEach((appointment, index) => {
            if (appointment.index < index) { 
                appointment.index = index;
            }
    
            if (appointment.index <= index) {
                appointment.width = Math.min(appointment.width, width);
                appointment.left = appointment.width * appointment.index;
    
                if (fillBefore) {
                    fillBefore = false;
                    appointment.width += extraWidth;
                    appointment.left -= leftOffset;
                }
    
                if (appointment.width < width) {
                    fillBefore = true;
                    extraWidth = width - appointment.width;
                    leftOffset = extraWidth;
                }
            } else {
                fillBefore = true;
                extraWidth = width - appointment.width;
                leftOffset = width;
            }
        });
    }

    // addAppointment(appointmentVis: AppointmentVis) {
    //     this.appointments.push(appointmentVis);
    //     console.log("this.appointments.length", this.appointments.length, this.startTime.toISOTime())
    //     this.appointments.forEach((appointment, index) => {
    //         appointment.width = 100 / this.appointments.length;
    //         appointment.left = appointment.width * index;
    //         //console.log(appointment.name, " left: ",appointment.left, " width",appointment.width, " index", index)
    //     })
    // }
}

export class AppointmentVis extends Appointment {
    viewHeight: number;
    paddingTopBorder: number;
    visBlockID: number;
    includedBlockIDs:Set<number>=new Set<number>();
    width: number = 100;
    left: number = 0;
    index: number = -1;

    constructor(appointment: Appointment, viewHeight: number, paddingTopBorder: number, visBlockID: number) {
        super(appointment.id, appointment.calendarID, appointment.name, appointment.startTime, appointment.endTime, appointment.message);
        this.viewHeight = viewHeight;
        this.paddingTopBorder = paddingTopBorder;
        this.visBlockID = visBlockID
    }
}

// import { DateTime, Duration } from 'luxon';
// import { Appointment } from '../appointment-model/appointment.model';

// export class VisBlock {
//     diplayTitleTop: string;
//     diplayTitleBottom: string;
//     duration: Duration;
//     dashBlock: boolean;

//     constructor(diplayTitleBottom: string, duration: Duration, diplayTitleTop: string | undefined = undefined, dashBlock: boolean = false) {
//         this.diplayTitleBottom = diplayTitleBottom;
//         this.duration = duration;
//         this.diplayTitleTop = diplayTitleTop ?? DateTime.fromFormat(diplayTitleBottom, 'HH:mm').minus(duration).toFormat('HH:mm');
//         this.dashBlock = dashBlock;
//     }

//     splitIntoIntervals(intervalDuration: Duration): VisBlock[] {
//         const totalMinutes = this.duration.as('minutes');
//         const intervalMinutes = intervalDuration.as('minutes');
//         const numberOfIntervals = Math.floor(totalMinutes / intervalMinutes);

//         const endTime = DateTime.fromFormat(this.diplayTitleBottom, 'HH:mm');
//         const startTime = endTime.minus(this.duration);

//         const visBlocks: VisBlock[] = [];

//         for (let i = 0; i < numberOfIntervals; i++) {
//             const intervalStartTime = startTime.plus({ minutes: i * intervalMinutes });
//             const intervalEndTime = intervalStartTime.plus(intervalDuration);

//             const intervalTitleTop = this.diplayTitleTop ? intervalStartTime.toFormat('HH:mm') : undefined;
//             const intervalTitleBottom = intervalEndTime.toFormat('HH:mm');

//             const newBlock = new VisBlock(intervalTitleBottom, intervalDuration, intervalTitleTop, this.dashBlock);
//             visBlocks.push(newBlock);
//         }
//         if (visBlocks.length > 0 && visBlocks[visBlocks.length - 1].diplayTitleBottom !== this.diplayTitleBottom) {
//             const endTime = DateTime.fromFormat(visBlocks[visBlocks.length - 1].diplayTitleBottom, 'HH:mm');
//             const startTime = endTime.minus(visBlocks[visBlocks.length - 1].duration);
//             const adjustedDuration = DateTime.fromFormat(this.diplayTitleBottom, 'HH:mm').diff(startTime);
//             visBlocks[visBlocks.length - 1].duration = Duration.fromObject({ minutes: adjustedDuration.as('minutes') });
//             visBlocks[visBlocks.length - 1].diplayTitleBottom = this.diplayTitleBottom;
//         }


//         return visBlocks;
//     }

//     /**
//      * Given a block function divedes it to half and generates two block out of it.
//      * Second block will be only hour. Example: if duration is 2 hours and 30 min first block
//      * will have 1 hour 30 min duration and second will have 1 hour. if duration is 4 hours
//      * both blocks will have 2 hour duration. Function also updates diplayTitleTop and diplayTitleBottom text.
//      * @returns 
//      */
//     splitVisBlock(): [VisBlock, VisBlock] {
//         const totalMinutes = this.duration.as('minutes');
//         const totalHours = Math.floor(totalMinutes / 60);
//         const remainingMinutes = totalMinutes % 60;

//         const halfHours = Math.floor(totalHours / 2);
//         const remainderHours = totalHours % 2;

//         // First block gets half the hours plus any remainder hours and all the remaining minutes
//         const firstBlockDuration = Duration.fromObject({ hours: halfHours + remainderHours, minutes: remainingMinutes });
//         // Second block gets the remaining half of the hours
//         const secondBlockDuration = Duration.fromObject({ hours: halfHours });

//         const endTime = DateTime.fromFormat(this.diplayTitleBottom, 'HH:mm');
//         const startTime = endTime.minus(this.duration);

//         const firstBlockEndTime = startTime.plus(firstBlockDuration);
//         const secondBlockEndTime = firstBlockEndTime.plus(secondBlockDuration);

//         const firstBlockTitleTop = this.diplayTitleTop ? startTime.toFormat('HH:mm') : undefined;
//         const firstBlockTitleBottom = firstBlockEndTime.toFormat('HH:mm');
//         const secondBlockTitleTop = this.diplayTitleTop ? firstBlockEndTime.toFormat('HH:mm') : undefined;
//         const secondBlockTitleBottom = secondBlockEndTime.toFormat('HH:mm');

//         const firstBlock = new VisBlock(firstBlockTitleBottom, firstBlockDuration, firstBlockTitleTop, this.dashBlock);
//         const secondBlock = new VisBlock(secondBlockTitleBottom, secondBlockDuration, secondBlockTitleTop, this.dashBlock);
//         console.log("splitVisBlock: ", firstBlock.diplayTitleTop, firstBlock.diplayTitleBottom, firstBlock.duration.toHuman())
//         console.log("splitVisBlock: ", secondBlock.diplayTitleTop, secondBlock.diplayTitleBottom, secondBlock.duration.toHuman())
//         return [firstBlock, secondBlock];
//     }
// }

// export class VisBlockWithAppointment extends VisBlock {
//     date: DateTime;
//     appointments: AppointmentVis[];

//     constructor(diplayTitle: string, duration: Duration, date: DateTime, appointments: AppointmentVis[]) {
//         super(diplayTitle, duration);
//         this.date = date;
//         this.appointments = appointments;
//     }
// }

// export class AppointmentVis extends Appointment {
//     viewHeight: number;
//     paddingTopBorder: number;

//     constructor(appointment: Appointment, viewHeight: number, paddingTopBorder:number) {
//         super(appointment.id, appointment.name, appointment.startTime, appointment.endTime, appointment.message);
//         this.viewHeight = viewHeight;
//         this.paddingTopBorder = paddingTopBorder;
//     }
// }
