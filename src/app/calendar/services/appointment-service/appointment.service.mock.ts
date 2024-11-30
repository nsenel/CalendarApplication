import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { DateTime } from 'luxon';
import { Appointment } from '../../models/appointment-model/appointment.model';
import { IAppointmentService } from './appointment.service.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentMockService implements IAppointmentService {
  private now: DateTime = DateTime.now().plus({day:1});
  private mockAppointments: Appointment[] = [
    {
      id: "1",
      calendarID: "0",
      name: 'Mehmet',
      startTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 11, minute: 0 }),
      endTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 11, minute: 45 }),
      message: 'First Appointment'
    },
    {
      id: "2",
      calendarID: "0",
      name: 'Eren',
      startTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 14, minute: 0 }),
      endTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 14, minute: 45 }),
      message: 'Second Appointment'
    },
    {
      id: "3",
      calendarID: "0",
      name: 'Senel',
      startTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 12, minute: 15 }).minus({ day: 1 }),
      endTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 12, minute: 45 }).minus({ day: 1 }),
      message: 'Third Appointment'
    },
    {
      id: "4",
      calendarID: "0",
      name: 'Senel2',
      startTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 12, minute: 15 }).minus({ day: 1 }),
      endTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 12, minute: 45 }).minus({ day: 1 }),
      message: 'Third Appointment'
    },
    {
      id: "5",
      calendarID: "0",
      name: 'Senel3',
      startTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 10, minute: 45 }).minus({ day: 1 }),
      endTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 14, minute: 0 }).minus({ day: 1 }),
      message: 'Third Appointment'
    },
    {
      id: "6",
      calendarID: "0",
      name: 'Senel4',
      startTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 13, minute: 30 }).minus({ day: 1 }),
      endTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 14, minute: 30 }).minus({ day: 1 }),
      message: 'Third Appointment'
    },
    {
      id: "7",
      calendarID: "0",
      name: 'Senel5',
      startTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 9, minute: 30 }).minus({ day: 1 }),
      endTime: DateTime.fromObject({ year: this.now.year, month: this.now.month, day: this.now.day, hour: 16, minute: 30 }).minus({ day: 1 }),
      message: 'Third Appointment'
    }
  ];
  private days: DateTime[] = [];
  private names = ['Mehmet', 'Eren', 'Sevnur', 'Ayse', 'Fatma', 'Ali', 'Veli', 'Numan'];

  constructor() { 
    // this.generateWeekDays();
    // this.generateMockAppointments();
  }

  private generateWeekDays() {
    // Get the current date and time
    const currentDate = DateTime.local();

    // Determine the start of the week (Monday)
    const startOfWeek = currentDate.startOf('week');

    // Generate the days from Monday to Sunday
    for (let i = -7; i < 14; i++) {
      this.days.push(startOfWeek.plus({ days: i }));
    }
  }

  private generateMockAppointments() {
    let appointmentId = 1;

    this.days.forEach(day => {
      const numberOfAppointments = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numberOfAppointments; i++) {
        const name = this.names[Math.floor(Math.random() * this.names.length)];
        const startHour = 7 + Math.floor(Math.random() * 12); // Random hour between 9 and 16
        const randomMinute = [0,15,30,45]
        const startTime = day.set({ hour: startHour, minute: randomMinute[Math.floor(Math.random() * randomMinute.length)] });
        // Randomize end time to be between 15 minutes to 2 hours and ends with 15, 30, 45, or 00
        const durationOptions = [15, 30, 45, 60, 75, 90, 105, 120];
        const randomDuration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
        const endTime = startTime.plus({ minutes: randomDuration });

        this.mockAppointments.push({
          id: (appointmentId++).toString(),
          calendarID:"0",
          name,
          startTime,
          endTime,
          message: `Appointment on ${day.toFormat('cccc, MMM dd')}`
        });
      }
    });
  }

  getAppointments(calendarID:string): Observable<Appointment[]> {
    return of(this.mockAppointments.filter((appointment)=> appointment.calendarID===calendarID));
  }

  getAppointmentsByDay(calendarID:string, day: DateTime): Observable<Appointment[]> {
    const appointmentsForDay = this.mockAppointments.filter(appointment =>
      appointment.startTime.hasSame(day, 'day') && appointment.calendarID===calendarID
    );
    return of(appointmentsForDay);
  }

  getAppointment(appointmentID: string): Observable<Appointment | null> {
    const found = this.mockAppointments.find(a => a.id === appointmentID);
    return of(found ? found : null);
  }

  setAppointment(appointment: Appointment): Observable<string> {
    // Randomly decide whether to succeed or fail
    const randomSuccess = Math.random() > 0.01;
    if (randomSuccess) {
      this.mockAppointments.push(appointment);
      return of(appointment.id.toString());
    } else {
      return throwError(() => new Error('Failed to set appointment'));
    }
  }

  editAppointment(appointment: Appointment): Observable<string> {
    const index = this.mockAppointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      this.mockAppointments[index] = appointment;
      return of(appointment.id.toString());
    }
    return throwError(() => new Error('Appointment not found'));
  }

  removeAppointment(appointment: Appointment): Observable<string> {
    this.mockAppointments = this.mockAppointments.filter(a => a.id !== appointment.id);
    return of('Appointment removed successfully');
  }
}
