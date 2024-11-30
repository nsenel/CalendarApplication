import { DateTime } from 'luxon';

export class Appointment {
  id: string;
  calendarID: string;
  name: string;
  startTime: DateTime;
  endTime: DateTime;
  message: string;

  constructor(id: string, calendarID: string, name: string, startTime: DateTime, endTime: DateTime, message: string = "") {
    this.id = id;
    this.calendarID = calendarID;
    this.name = name;
    this.startTime = startTime;
    this.endTime = endTime;
    this.message = message;
  }

  static fromDbModel(supabaseAppointment: any): Appointment {
    return new Appointment(
      supabaseAppointment.id,
      supabaseAppointment.calendar_id,
      supabaseAppointment.appointment_info?.name ?? "**",
      DateTime.fromISO(supabaseAppointment.start_time),
      DateTime.fromISO(supabaseAppointment.end_time),
      supabaseAppointment.appointment_info?.message ?? ""
    );
  }

  // static toDbModel(appointment: Appointment)
  // {
  //   authedUser.tenantID = supabaseUserInfo.tenant_id,
  //   authedUser.username = supabaseUserInfo.user_name,
  //   authedUser.role = supabaseUserInfo.access_level as UserType;
  // }
}