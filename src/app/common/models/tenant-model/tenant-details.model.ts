export class TenantDetails {
  tenantID: string;
  owner: string;
  name: string;
  restrictedUserRegister: boolean;
  constructor(tenantID: string, owner: string, name: string, restrictedUserRegister: boolean = true) {
    this.tenantID = tenantID;
    this.owner = owner;
    this.restrictedUserRegister = restrictedUserRegister;
    this.name = name;
  }
}