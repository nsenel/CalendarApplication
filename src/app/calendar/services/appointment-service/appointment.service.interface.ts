import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DateTime } from 'luxon';
import { Appointment } from "../../models/appointment-model/appointment.model";

@Injectable()
export abstract class IAppointmentService {
  // returns observable that resolves to 
  abstract getAppointments(calendarID:string): Observable<Appointment[]>;

  // returns observable that resolves to
  abstract getAppointmentsByDay(calendarID:string, day:DateTime): Observable<Appointment[]>;

  // returns observable that resolves to 
  abstract getAppointment(appointmentID: string): Observable<Appointment | null>;

  // returns observable that resolves to
  abstract setAppointment(appointment: Appointment): Observable<string>;

  // returns observable that resolves to 
  abstract editAppointment(appointment: Appointment): Observable<string>;

  // returns observable that resolves to 
  abstract removeAppointment(appointment: Appointment): Observable<string>;
}
