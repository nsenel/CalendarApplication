import { Injectable } from '@angular/core';
import { ILoginService } from './login.service.interface';
import { User, UserType } from '../../models/user/user.model';
import { supabase } from 'src/app/common/superbase/base-client';
import { ITenantService } from 'src/app/common/sevices/tenant-service/tenant.service.interface';
import { BehaviorSubject } from 'rxjs';
import { TenantDetails } from 'src/app/common/models/tenant-model/tenant-details.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService implements ILoginService {
  private currentUser: User | null = null;
  private readonly _userLogedin$ = new BehaviorSubject<boolean>(false);
  public readonly userLogedin$ = this._userLogedin$.asObservable();

  constructor(private tenantService: ITenantService) {
    this.initializeUser();
    console.log("I am going to autologin!!")
    //this.login("owner2@email.com","owner2")
    //this.login("owner@email.com","owner")
    //this.login("admin@email.com", "admin")
    //this.login("regular@email.com", "regular")
    //this.signUpNewUser()
  }

  isUserRegisterRestricted(): boolean {
    const details = this.tenantService.getCacheTenantDetails();
    return details ? details.restrictedUserRegister : false
  }

  public async signUpNewUser(userEmail:string, password:string) {
    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: password
    });
    if (error) {
        console.error('Sign-up error:', error.message, error);
    } else {
        console.log('Sign-up successful:', data);
    }
}

  // Initialize the current user from Supabase session
  private async initializeUser(): Promise<void> {
    const { data, error } = await supabase.auth.getUser();
    if (data.user) {
      this.currentUser = User.fromSupabaseUser(data.user);
      this.getUserDetails();
    }
    if (error) {
      console.log("Login error:", error)
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return Promise.resolve(false);
    }
    this.currentUser = User.fromSupabaseUser(data.user);
    this._userLogedin$.next(true);
    return this.getUserDetails();
  }

  // Supabase logout
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error.message);
    } else {
      this._userLogedin$.next(false);
      this.currentUser = null;
    }
  }

  private async getUserDetails(): Promise<boolean>
  {
    if (this.currentUser) {
      const { data, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('user_id', this.currentUser.id).single()
      if(!error)
      {
        User.fromSupabaseUserInfo(this.currentUser, data);
        this.tenantService.setTenant(this.currentUser.tenantID);
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getUserRole(): UserType | null {
    if (this.currentUser && this.currentUser.role) {
      return this.currentUser.role
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
