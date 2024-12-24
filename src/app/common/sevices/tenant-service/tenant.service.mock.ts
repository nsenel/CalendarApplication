import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ITenantService } from './tenant.service.interface';
import { TenantDetails } from '../../models/tenant-model/tenant-details.model';

@Injectable({
    providedIn: 'root',
})
export class TenantMockService extends ITenantService {
    mockTenantsDetails: TenantDetails[] = [new TenantDetails("0", "0", "Mock A"), new TenantDetails("1", "3", "Mock B")];

    getAllTenantDetails(): Promise<TenantDetails[] | undefined> {
        return Promise.resolve(this.mockTenantsDetails);
      }

    getTenantDetails(tenantID: string): Promise<TenantDetails | undefined> {
        if(this.tenantDetails){return Promise.resolve(this.tenantDetails);}
        const tenantDetails = this.mockTenantsDetails.find((tenant) => tenant.tenantID === tenantID)
        return Promise.resolve(tenantDetails ? tenantDetails : undefined);
    }

    updateTenantDetails(details: TenantDetails): Promise<boolean> {
        const tenantIndex = this.mockTenantsDetails.findIndex((tenant) => tenant.tenantID === details.tenantID);
        if (tenantIndex >= 0) {
            this.mockTenantsDetails[tenantIndex].restrictedUserRegister = details.restrictedUserRegister;
        }
        return Promise.resolve(tenantIndex >= 0 ? true : false);
    }
}