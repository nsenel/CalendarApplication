import { Injectable } from "@angular/core";
import { User, UserType } from "../../models/user/user.model";
import { Observable } from "rxjs";

@Injectable()
export abstract class ILoginService {
  abstract readonly userLogedin$: Observable<boolean>;

  abstract demoLogin(tenant: string, UserType: UserType): Promise<boolean>;

  abstract login(username: string, password: string): Promise<boolean>;

  abstract isUserRegisterRestricted(): boolean;

  abstract signUpNewUser(email: string, password: string): void;

  abstract logout(): void;

  /**
   * Checks if a user is currently authenticated.
   * @returns True if a user is authenticated, false otherwise.
   */
  abstract isAuthenticated(): boolean;

  /**
   * Gets the currently authenticated user.
   * @returns User if a user is authenticated, null otherwise.
   */
  abstract getCurrentUser(): User | null

  /**
   * Gets the role of the currently authenticated user.
   * @returns The role of the user ('ADMIN' | 'REGULAR' | etc.) or null if no user is authenticated.
   */
  abstract getUserRole(): UserType | null;
}
