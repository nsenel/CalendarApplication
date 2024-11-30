// user-settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUserSettingsService } from './user-settings.service.interface';
import { User } from 'src/app/common/components/user/models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService implements IUserSettingsService {
  private apiUrl = 'https://api.example.com/user-settings'; 

  constructor(private http: HttpClient) {}

  changeEmail(newEmail: string, user: User): Promise<void> {
    return Promise.resolve();
  }

  changeName(newName: string, user: User): Promise<void> {
    return Promise.resolve();
  }

  changePassword(currentPassword: string, newPassword: string, user: User): Promise<void> {
    return Promise.resolve();
  }
}