import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ITenantService } from '../common/sevices/tenant-service/tenant.service.interface';
import { TenantDetails } from '../common/models/tenant-model/tenant-details.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserType } from '../common/components/user/models/user/user.model';
import { ILoginService } from '../common/components/user/sevices/login/login.service.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  UserType = UserType;
  tenantForm: FormGroup;
  tenant: string | undefined = undefined;
  tenants: TenantDetails[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private tenantService: ITenantService,
    private userService: ILoginService,
  ) {
    this.tenantForm = this.fb.group({
      tenant: [null]
    });
  }


  ngOnInit(): void {
    this.tenantService.getAllTenantDetails().then(tenants => {
      this.tenants = tenants ?? []
      if (this.tenant && this.tenants.length > 0) {
        const matchingTenant = this.tenants.find(t => t.tenantID === this.tenant);
        this.tenantForm.get('tenant')?.setValue(matchingTenant?.tenantID ?? null, { emitEvent: false });
      }
    })
    this.tenantForm.get('tenant')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((tenantId) => {
      this.onTenantChange(tenantId);
    });

    this.tenantService.tenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tenant => {
        this.tenant = tenant;
        const matchingTenant = this.tenants.find(t => t.tenantID === tenant);
        this.tenantForm.get('tenant')?.setValue(matchingTenant?.tenantID ?? null, { emitEvent: false });
      });

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const routeTenant = params.get('tenant');
        if (routeTenant) {
          this.tenantService.setTenant(routeTenant);
        }
      });
  }

  demoLogin(userType: UserType) {
    this.userService.demoLogin(this.tenant ?? "", userType);
  }

  onTenantChange(selectedTenantId: string): void {
    this.tenantService.setTenant(selectedTenantId);
  }

  isAuthenticated(): boolean {
    return this.userService.isAuthenticated();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
