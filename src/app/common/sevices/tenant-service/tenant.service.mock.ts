import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ITenantService } from './tenant.service.interface';
import { TenantDetails } from '../../models/tenant-model/tenant-details.model';

@Injectable({
    providedIn: 'root',
})
export class TenantMockService extends ITenantService {
    tenantsDetails: TenantDetails[] = [new TenantDetails("0", "0"), new TenantDetails("1", "3")];

    getTenantDetails(tenantID: string): Observable<TenantDetails | undefined> {
        const tenantDetails = this.tenantsDetails.find((tenant) => tenant.tenantID === tenantID)
        return of(tenantDetails ? tenantDetails : undefined);
    }

    updateTenantDetails(details: TenantDetails): Observable<boolean> {
        const tenantIndex = this.tenantsDetails.findIndex((tenant) => tenant.tenantID === details.tenantID);
        if (tenantIndex >= 0) {
            this.tenantsDetails[tenantIndex].restrictedUserRegister = details.restrictedUserRegister;
        }
        return of(tenantIndex >= 0 ? true : false);
    }
}