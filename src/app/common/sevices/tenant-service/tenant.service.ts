import { Injectable } from '@angular/core';
import { TenantDetails } from '../../models/tenant-model/tenant-details.model';
import { ITenantService } from './tenant.service.interface';
import { supabase } from '../../superbase/base-client';

@Injectable({
  providedIn: 'root',
})
export class TenantService extends ITenantService {

  getTenantDetails(tenantID: string): Promise<TenantDetails | undefined> {
    if (this.tenantDetails) { return Promise.resolve(this.tenantDetails); } 
    return this.fetchTenantDetails(tenantID);
  }

  getAllTenantDetails(): Promise<TenantDetails[] | undefined> {
    return this.fetchAllTenantDetails();
  }

  updateTenantDetails(details: TenantDetails): Promise<boolean> {
    return this.updateTenantDetailsTable(details);
  }

  // --- Real backend function implementations 'Supabase' ---

  private async fetchAllTenantDetails(): Promise<TenantDetails[] | undefined> {
    const { data, error } = await supabase
      .from('tenants').select('*');
    if (error) {
      console.log(error)
      console.error('Error fetching tenant details:', error);
      return Promise.reject(new Error('Error fetching tenant details:' + error));
    }
    return Promise.resolve(data.map(data => new TenantDetails(data['tenant_id'], data['owner'], data['name'], data['restricted_user_register'])));
  }

  private async fetchTenantDetails(tenantID: string): Promise<TenantDetails | undefined> {
    const { data, error } = await supabase
      .from('tenants').select('*').eq('tenant_id', tenantID).single();
    if (error) {
      console.log(error)
      console.error('Error fetching ' + tenantID + 'tenant details:', error);
      return Promise.reject(new Error('Error fetching ' + tenantID + ' tenant details:' + error));
    }
    return Promise.resolve(new TenantDetails(data['tenant_id'], data['owner'], data['name'], data['restricted_user_register']));
  }

  private async updateTenantDetailsTable(details: TenantDetails): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ restricted_user_register: details.restrictedUserRegister })
        .eq('tenant_id', details.tenantID)
        .eq('owner', details.owner)
        .single();
      if (error) throw error;
      else {
        return this.fetchTenantDetails(details.tenantID).then((_) => {
          return _ ? Promise.resolve(true) : Promise.resolve(false)
        })
      }
    } catch (error) {
      console.error('Error in update tenant details:', error);
      return Promise.reject(new Error('Error in update tenant details:' + error));
    }
  }
}