export enum UserType {
  VISITOR = 0,
  REGULAR = 1,
  ADMIN = 2,
  PRODUCT_OWNER = 3
}
// todo refactor this userinfo and user is almost the same maybe merge in backend 2 table
export class UserInfo {
  id: string;
  tenantID: string;
  username: string;
  role: UserType;

  constructor(id: string, tenantID: string, username: string, role: UserType = UserType.VISITOR) {
    this.id = id;
    this.tenantID = tenantID;
    this.username = username;
    this.role = role;
  }
}

export class User {
  id: string;
  email: string;
  username: string;
  role: UserType;
  tenantID: string;

  constructor(id: string, email: string, username?: string, tennantID: string = "", role: UserType = UserType.VISITOR) {
    this.id = id;
    this.email = email;
    this.tenantID = tennantID;
    this.username = username ?? email;
    this.role = role;
  }

  static fromSupabaseUser(supabaseUser: any): User {
    return new User(
      supabaseUser.id,
      supabaseUser.email
    );
  }

  static fromSupabaseUserInfo(authedUser: User, supabaseUserInfo: any) {
    authedUser.tenantID = supabaseUserInfo.tenant_id,
      authedUser.username = supabaseUserInfo.user_name,
      authedUser.role = supabaseUserInfo.access_level as UserType;
  }
  static supabaseUserInfo(supabaseUserInfo: any): UserInfo {
    return new UserInfo(supabaseUserInfo.user_id, supabaseUserInfo.tenant_id, supabaseUserInfo.user_name, supabaseUserInfo.access_level as UserType)
  }
}
