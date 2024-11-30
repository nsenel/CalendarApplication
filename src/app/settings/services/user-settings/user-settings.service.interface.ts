import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/common/components/user/models/user/user.model';

@Injectable()
export abstract class IUserSettingsService {
    abstract changeEmail(newEmail: string, user: User): Promise<void>;
    abstract changeName(newName: string, user: User): Promise<void>;
    abstract changePassword(currentPassword: string, newPassword: string, user: User): Promise<void>;
}