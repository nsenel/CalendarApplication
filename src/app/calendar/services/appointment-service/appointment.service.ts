import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { from, Observable } from 'rxjs';
import { Appointment } from '../../models/appointment-model/appointment.model';
import { IAppointmentService } from './appointment.service.interface';
import { ILoginService } from 'src/app/common/components/user/sevices/login/login.service.interface';
import { supabase } from 'src/app/common/superbase/base-client';
import { ITenantService } from 'src/app/common/sevices/tenant-service/tenant.service.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService implements IAppointmentService {

  constructor(private userService: ILoginService, private tenantService: ITenantService) { }

  getAppointments(calendarID: string): Observable<Appointment[]> {
    return from(this.fetchAppointments(calendarID));
  }

  getAppointmentsByDay(calendarID: string, day: DateTime): Observable<Appointment[]> {
    return from(this.fetchAppointments(calendarID, day));
  }

  getAppointment(appointmentID: string): Observable<Appointment | null> {
    return from(this.fetchAppointment(appointmentID));
  }

  setAppointment(appointment: Appointment): Observable<string> {
    return from(this.insertAppointment(appointment));
  }

  editAppointment(appointment: Appointment): Observable<string> {
    return from(this.updateAppointment(appointment));
  }

  removeAppointment(appointment: Appointment): Observable<string> {
    return from(this.deleteAppointment(appointment));
  }

  // --- Real backend function implementations 'Supabase' ---

  private async fetchAppointments(calendarID: string, start_day?: DateTime, end_date?: DateTime): Promise<Appointment[]> {
    const tenantId: string | undefined = this.tenantService.getTenant();
    if (tenantId === undefined) {
      return Promise.reject(new Error("Can not read tenant"))
    }
    const selectedDate = start_day ? start_day.startOf('day').toISO() : null;
    // Take end_date if avaible, if not take start_date, if also not avaible set it to null
    const selectedDateEnd = end_date ? end_date.endOf('day').toISO() : start_day ? start_day.endOf('day').toISO() : null;
    const { data, error } = await supabase
      .rpc('get_appointments_by_calendar_id', {
        p_calendar_id: calendarID, p_tenant_id: tenantId, selected_date: selectedDate,
        selected_date_end: selectedDateEnd
      }) as { data: any[] | null, error: any };
    if (data) { return data.map(appointments => Appointment.fromDbModel(appointments)); }
    else {
      console.error('Error fetching appointments settings:', error);
      return Promise.reject(new Error('Error fetching calendar settings:' + error))
    }
  }

  private async fetchAppointment(appointmentID: string): Promise<Appointment> {
    const tenantId: string | undefined = this.tenantService.getTenant()
    if (tenantId === undefined) {
      return Promise.reject(new Error("Can not read tenant"))
    }
    const { data, error } = await supabase
      .rpc('get_appointment_by_id', {
        p_appointment_id: appointmentID, p_tenant_id: tenantId
      }).single();// as { data: any | null, error: any };
    if (error) {
      console.error('Error fetching appointments settings:', error);
      return Promise.reject(new Error('Error fetching calendar settings:' + error))
    }
    const appointment: Appointment = Appointment.fromDbModel(data);
    return Promise.resolve(appointment)
  }

  private async insertAppointment(appointment: Appointment): Promise<string> {
    const uuid = crypto.randomUUID();
    const tenantId: string | undefined = this.tenantService.getTenant();
    if (tenantId === undefined) {
      return Promise.reject(new Error("Can not read tenant"))
    }
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        id: uuid,
        calendar_id: appointment.calendarID,
        created_by: this.userService.getCurrentUser()?.id,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        appointment_info: { "name": appointment.name, "message": appointment.message },
      }])
    if (error) {
      console.error('Error inserting appointment:', error);
      return Promise.reject(new Error('Error inserting appointment: ' + error.message));
    }
    return Promise.resolve(uuid)
  }

  private async updateAppointment(appointment: Appointment): Promise<string> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          start_time: appointment.startTime,
          end_time: appointment.endTime,
          appointment_info: { 'name': appointment.name, 'message': appointment.message }
        })
        .eq('id', appointment.id).single()
      if (error) throw error;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return Promise.reject(new Error('Error occurred in updating appointment'));
    }
    return Promise.resolve(appointment.id);
  }

  private async deleteAppointment(appointment: Appointment): Promise<string> {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', appointment.id).single();
      if (error) throw error;
    } catch (error) {
      console.log("Error in delete operation")
      return Promise.reject(new Error('Error occurred in delete appointment'));
    }
    return Promise.resolve(appointment.id);
  }
}
