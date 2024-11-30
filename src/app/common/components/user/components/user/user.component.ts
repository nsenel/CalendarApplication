import { Component, ViewChild } from '@angular/core';
import { ILoginService } from '../../sevices/login/login.service.interface';
import { NotificationService } from 'src/app/common/components/notification/sevices/notification/notification.service';
import { NotificationMessage, NotificationType } from 'src/app/common/components/notification/models/notification/notification.model';
import { LoginFormComponent } from '../login-form/login-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})

export class UserComponent {
  @ViewChild(LoginFormComponent, { static: false }) loginForm!:LoginFormComponent;

  constructor(private userService: ILoginService, private notificationService: NotificationService, private router: Router) {
  }

  isRegisterAllowed():boolean {
    console.log("this.userService.isUserRegisterRestricted();",this.userService.isUserRegisterRestricted())
    return !this.userService.isUserRegisterRestricted();
  }

  isUserLogedIn(): boolean {
    return this.userService.isAuthenticated();
  }

  onLogoutClick() {
    this.userService.logout();
    this.notificationService.showNotification(new NotificationMessage('Logout completed successfully', NotificationType.Success, 4000));
    // Navigate to the home page
    this.router.navigate(['/']);
  }

}
