import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationMessage, NotificationType } from 'src/app/common/components/notification/models/notification/notification.model';
import { NotificationService } from 'src/app/common/components/notification/sevices/notification/notification.service';
import { ILoginService } from '../../sevices/login/login.service.interface';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  @Input() registerAllowed:boolean = false;
  loginForm: FormGroup;

  constructor(private userService: ILoginService, private notificationService: NotificationService, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]]
    });
  }
  
  onSubmit(): void {
    //this.userService.signUpNewUser(this.loginForm.get('username')?.value, this.loginForm.get('password')?.value)
    if (this.loginForm.valid) {
      this.userService.login(this.loginForm.get('username')?.value, this.loginForm.get('password')?.value).then((value) => {
        this.loginForm.controls['password'].reset();
        if(value)
        {
          this.notificationService.showNotification(new NotificationMessage('Login completed successfully', NotificationType.Success, 4000));
        }
        else{
          this.notificationService.showNotification(new NotificationMessage('Login completed failed', NotificationType.Error, 4000));
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  resetForm() {
    this.loginForm.reset();
  }

  onRegisterClick()
  {
    console.log("register called.")
  }

}
