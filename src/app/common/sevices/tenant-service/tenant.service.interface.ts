import { BehaviorSubject, Observable } from 'rxjs';
import { TenantDetails } from '../../models/tenant-model/tenant-details.model';

export abstract class ITenantService {
  private readonly _tenant$ = new BehaviorSubject<string | undefined>(undefined);
  public readonly tenant$ = this._tenant$.asObservable();

  setTenant(tenant: string): void {
    this._tenant$.next(tenant);
  }

  clearTenant(): void {
    this._tenant$.next(undefined);
  }

  hasTenant(): boolean {
    return this._tenant$.value !== undefined;
  }

  getTenant(): string | undefined {
    return this._tenant$.value;
  }

  // Abstract methods for fetching/updating tenant details
  abstract getTenantDetails(tenantID: string): Observable<TenantDetails | undefined>;
  abstract updateTenantDetails(details: TenantDetails): Observable<boolean>;
}