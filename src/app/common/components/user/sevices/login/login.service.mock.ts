import { Injectable } from '@angular/core';
import { ILoginService } from './login.service.interface';
import { User, UserType } from '../../models/user/user.model';
import { getPassword, mockUsers, userPasswords } from './mock.data'
import { ITenantService } from 'src/app/common/sevices/tenant-service/tenant.service.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginMockService implements ILoginService {
  private currentUser: User | null = null;
  private sessionExpirationTime: number | null = null;
  private readonly sessionDuration = 30 * 60 * 1000;
  private readonly _userLogedin$ = new BehaviorSubject<boolean>(false);
  public readonly userLogedin$ = this._userLogedin$.asObservable();

  constructor(private tenantService: ITenantService) {
  }

  async login(username: string, password: string): Promise<boolean> {
    await this.simulateDelay();

    // Validate credentials
    const user = mockUsers.find(u => u.username === username);
    if (user && getPassword(user.username) === password) {
      this.currentUser = { ...user };
      this.tenantService.setTenant(this.currentUser.tenantID);
      this.sessionExpirationTime = Date.now() + this.sessionDuration;
      this._userLogedin$.next(true);
      console.log(`Login successful. User role: ${user.role}`);
      return Promise.resolve(true);
    } else {
      console.log('Login failed: Invalid username or password.');
      return Promise.resolve(false);
    }
  }

  isUserRegisterRestricted(): boolean {
    const details = this.tenantService.getCacheTenantDetails();
    return details ? details.restrictedUserRegister : false
  }

  async signUpNewUser(email: string, password: string) {
    const id = Math.floor(Math.random() * 1000);
    mockUsers.push(new User(id.toString(), 'regular ' + id, this.tenantService.getTenant(), email, UserType.REGULAR))
    userPasswords["regular" + id] = password;
  }

  logout(): void {
    this.currentUser = null;
    this.sessionExpirationTime = null;
    this._userLogedin$.next(false);
    console.log('User logged out.');
  }

  isAuthenticated(): boolean {
    if (this._userLogedin$.value && this.sessionExpirationTime && Date.now() < this.sessionExpirationTime) {
      return true;
    } else {
      if (this._userLogedin$.value) {
        this._userLogedin$.next(false);
      }
      this.currentUser = null;
      this.sessionExpirationTime = null;
      return false;
    }
  }

  getUserRole(): UserType | null {
    if (this.isAuthenticated() && this.currentUser) {
      return this.currentUser.role ?? null;
    }
    return null;
  }

  getCurrentUser(): User | null {
    if (this.isAuthenticated()) {
      return this.currentUser;
    }
    return null;
  }


  // Simulate network delay
  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}
