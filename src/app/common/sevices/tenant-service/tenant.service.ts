import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantDetails } from '../../models/tenant-model/tenant-details.model';
import { ITenantService } from './tenant.service.interface';

@Injectable({
  providedIn: 'root',
})
export class TenantService extends ITenantService {
  private apiUrl = 'https://api.example.com/tenants'; // Replace with your actual API URL
  private currentTenant?: string;

  constructor(private http: HttpClient) {
    super();
  }

  getTenantDetails(tenantID: string): Observable<TenantDetails | undefined> {
    if (!this.currentTenant) {
      throw new Error('No tenant is set');
    }
    return this.http.get<TenantDetails>(`${this.apiUrl}/${this.currentTenant}`);
  }

  updateTenantDetails(details: TenantDetails): Observable<boolean> {
    if (!this.currentTenant) {
      throw new Error('No tenant is set');
    }
    return this.http.put<boolean>(`${this.apiUrl}/${this.currentTenant}`, details);
  }
}