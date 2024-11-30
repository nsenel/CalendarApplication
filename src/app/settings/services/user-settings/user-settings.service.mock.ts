// user-settings.mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { IUserSettingsService } from './user-settings.service.interface';
import { User } from 'src/app/common/components/user/models/user/user.model';
import { getPassword, mockUsers, userPasswords } from 'src/app/common/components/user/sevices/login/mock.data';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsMockService implements IUserSettingsService {
  failTreshHold: number = 0.00001;

  private findUser(username: string): User | undefined {
    return mockUsers.find(u => u.username === username);
  }

  changeEmail(newEmail: string, user: User): Promise<void> {
    const randomSuccess = Math.random() > this.failTreshHold;
    const foundUser = this.findUser(user.username);

    if (randomSuccess && foundUser) {
      foundUser.email = newEmail;
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('Failed to change email'));
    }
  }

  changeName(newName: string, user: User): Promise<void> {
    const randomSuccess = Math.random() > this.failTreshHold;
    const foundUser = this.findUser(user.username);

    if (randomSuccess && foundUser) {
      foundUser.username = newName;
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('Failed to change name'));
    }
  }

  changePassword(currentPassword: string, newPassword: string, user: User): Promise<void> {
    const randomSuccess = Math.random() > this.failTreshHold;
    const foundUser = this.findUser(user.username);

    if (randomSuccess && foundUser) {
      if (getPassword(foundUser.username) === currentPassword) {
        userPasswords[foundUser.username] = newPassword;
        return Promise.resolve();
      } else {
        return Promise.reject(new Error('Current password is incorrect'));
      }
    } else {
      return Promise.reject(new Error('Failed to change password'));
    }
  }
}