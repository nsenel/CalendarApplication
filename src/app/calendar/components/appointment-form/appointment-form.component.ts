import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Appointment } from '../../models/appointment-model/appointment.model';
import { VisBlockWithAppointment } from '../../models/vis-block-model/vis-block.model';
import { ILoginService } from 'src/app/common/components/user/sevices/login/login.service.interface';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent {
  @Input() formViewOpen!: boolean;
  @Input() appointmentBlock!: VisBlockWithAppointment;
  @Input() appointment: Appointment | undefined;
  @Input() calendarID: string | undefined;

  @Output() formViewOpenChange = new EventEmitter<boolean>();
  @Output() appointmentChange = new EventEmitter<Appointment>();

  appointmentForm: FormGroup;

  constructor(private fb: FormBuilder, private userService: ILoginService) {
    this.appointmentForm = this.fb.group({
      name: ['', Validators.required],
      start_time: ['', [Validators.required]],
      end_time: ['', [Validators.required]],
      message: ['']
    }, { validators: this.startTimeBeforeEndTimeValidator });
  }

  ngOnInit(): void {
    if (this.appointment == undefined) {
      const userName = this.userService.getCurrentUser()?.username ?? "";
      this.calendarID = this.calendarID ?? "unknown";
      this.appointment = new Appointment(Math.floor(Math.random() * 10000).toString(), this.calendarID, userName, this.appointmentBlock.startTime, this.appointmentBlock.endTime)
    }
    this.appointmentForm.get('start_time')?.setValue(this.appointment.startTime.toFormat('HH:mm'));
    this.appointmentForm.get('end_time')?.setValue(this.appointment.endTime.toFormat('HH:mm'));
    this.appointmentForm.get('message')?.setValue(this.appointment.message);
    if (this.userService.getCurrentUser()) {
      const nameControl = this.appointmentForm.get('name');
      nameControl?.setValue(this.appointment.name);
      nameControl?.disable();
    }
  }

  startTimeBeforeEndTimeValidator(control: AbstractControl): ValidationErrors | null {
    const startTime = control.get('start_time')?.value;
    const endTime = control.get('end_time')?.value;

    if (!startTime || !endTime) {
      return null;
    }
    // Compare times as strings (24-hour format)
    return startTime < endTime ? null : { startTimeAfterEndTime: true };
  }

  onSubmit(): void {
    if (this.appointmentForm.valid && this.appointment) {
      const startTimeString = this.appointmentForm.get('start_time')?.value;
      const endTimeString = this.appointmentForm.get('end_time')?.value;

      if (startTimeString) {
        const startTimeArray = startTimeString.split(':');
        this.appointment.startTime = this.appointment.startTime.set({ hour: +startTimeArray[0], minute: +startTimeArray[1] });
      }

      if (endTimeString) {
        const endTimeArray = endTimeString.split(':');
        this.appointment.endTime = this.appointment.endTime.set({ hour: +endTimeArray[0], minute: +endTimeArray[1] });
      }
      this.appointment.name = this.appointmentForm.get('name')?.value;
      this.appointment.message = this.appointmentForm.get('message')?.value;
      this.appointmentChange.emit(this.appointment);
      this.closeModal();
    } else {
      this.appointmentForm.markAllAsTouched();
    }
  }

  closeModal(): void {
    this.formViewOpen = false;
    this.formViewOpenChange.emit(false);
  }


}
