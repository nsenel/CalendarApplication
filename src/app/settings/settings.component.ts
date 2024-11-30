import { Component, OnInit } from '@angular/core';
import { ILoginService } from '../common/components/user/sevices/login/login.service.interface';
import { UserType } from '../common/components/user/models/user/user.model';
import { CalendarAction, CalendarActionPayload } from './models/calendar-action-enum';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  UserType = UserType;
  currentUserType: UserType = UserType.VISITOR
  calendarAction: CalendarActionPayload | undefined;

  constructor(private userService: ILoginService) { }
  ngOnInit() {
    this.currentUserType = this.userService.getUserRole() ?? this.currentUserType;
  }

  onNewCalendarAction(action: CalendarActionPayload) {
    this.calendarAction = action;
  }

}