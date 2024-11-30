import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ITenantService } from '../common/sevices/tenant-service/tenant.service.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  tenant: string | undefined = undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private tenantService: ITenantService
  ) {}


  ngOnInit(): void {
    this.tenantService.tenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tenant => {
        this.tenant = tenant;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
