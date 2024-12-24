import { BehaviorSubject, Observable } from 'rxjs';
import { TenantDetails } from '../../models/tenant-model/tenant-details.model';

export abstract class ITenantService {
  protected tenantDetails: TenantDetails | undefined;
  private readonly _tenant$ = new BehaviorSubject<string | undefined>(undefined);
  public readonly tenant$ = this._tenant$.asObservable();

  setTenant(tenant: string): void {
    this.getTenantDetails(tenant).then((details) => {
      if (details) {
        this.tenantDetails = details;
        this._tenant$.next(tenant);
      }
    })
  }

  clearTenant(): void {
    this.tenantDetails = undefined;
    this._tenant$.next(undefined);
  }

  hasTenant(): boolean {
    return this.tenantDetails !== undefined;
  }

  getTenant(): string | undefined {
    return this._tenant$.value;
  }

  getCacheTenantDetails(): TenantDetails | undefined {
    return this.tenantDetails;
  }

  // Abstract methods for fetching/updating tenant details
  abstract getTenantDetails(tenantID: string): Promise<TenantDetails | undefined>;
  abstract getAllTenantDetails(): Promise<TenantDetails[] | undefined>;
  abstract updateTenantDetails(details: TenantDetails): Promise<boolean>;
}