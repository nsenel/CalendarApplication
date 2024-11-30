export class TenantDetails {
    tenantID: string;
    owner: string;
    restrictedUserRegister: boolean;
    constructor(tenantID: string, owner: string, restrictedUserRegister: boolean = true) {
      this.tenantID = tenantID;
      this.owner = owner;
      this.restrictedUserRegister = restrictedUserRegister;
    }
  }