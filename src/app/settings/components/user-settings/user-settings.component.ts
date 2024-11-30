import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/common/components/notification/sevices/notification/notification.service';
import { ILoginService } from 'src/app/common/components/user/sevices/login/login.service.interface';
import { IUserSettingsService } from '../../services/user-settings/user-settings.service.interface';
import { NotificationMessage, NotificationType } from 'src/app/common/components/notification/models/notification/notification.model';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  userProfileForm: FormGroup;
  userPasswordForm: FormGroup;
  isEditing: boolean = false;
  changePassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: ILoginService,
    private userSettingsService: IUserSettingsService,
    private notificationService: NotificationService
  ) {
    this.userProfileForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      username: [{ value: '', disabled: true }, Validators.required],
    });

    this.userPasswordForm = this.fb.group({
      currentPassword: [{ value: '', disabled: true }, Validators.required],
      newPassword: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(4)]],
      repeatPassword: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(4)]],
    }, {
      validators: this.passwordMatchValidator()
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newPassword = control.get('newPassword')?.value;
      const repeatPassword = control.get('repeatPassword')?.value;
      return newPassword && repeatPassword && newPassword !== repeatPassword ? { 'passwordMismatch': true } : null;
    };
  }

  createPasswordStrengthValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
        const value = control.value;
        if (!value) {
            return null;
        }
        const hasUpperCase = /[A-Z]+/.test(value);
        const hasLowerCase = /[a-z]+/.test(value);
        const hasNumeric = /[0-9]+/.test(value);
        const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;
        return !passwordValid ? {passwordStrength:true}: null;
    }
}

  ngOnInit(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.userProfileForm.patchValue({
        email: currentUser.email,
        username: currentUser.username,
      });
    }
  }

  toggleChangePassword() {
    if (this.changePassword) {
      this.userPasswordForm.enable();
    }
    else {
      this.userPasswordForm.disable();
      this.userPasswordForm.reset();
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.userProfileForm.enable();
    } else {
      if (this.changePassword) {
        this.changePassword = false;
        this.toggleChangePassword();
      }
      this.userProfileForm.disable();
      this.userProfileForm.reset(this.userService.getCurrentUser());
    }
  }

  cancelEdit() {
    this.toggleEdit();
  }

  saveSettings() {
    if (this.userProfileForm.valid) {
      const currentUser = this.userService.getCurrentUser();
      if (!currentUser) return;

      const userProfileForm = this.userProfileForm.value;

      if (this.userProfileForm.get("email")?.touched && userProfileForm.email !== currentUser.email) {
        this.userSettingsService.changeEmail(userProfileForm.email, currentUser);
      }
      if (this.userProfileForm.get("username")?.touched && userProfileForm.username !== currentUser.username) {
        this.userSettingsService.changeName(userProfileForm.username, currentUser);
      }
      if (this.changePassword && this.userPasswordForm.get("currentPassword")?.touched) {
        this.userSettingsService.changePassword(this.userPasswordForm.value.currentPassword, this.userPasswordForm.value.newPassword, currentUser);
      }

      this.notificationService.showNotification(
        new NotificationMessage('Profile updated successfully', NotificationType.Success, 4000)
      );

      this.toggleEdit();
    }
  }
}
