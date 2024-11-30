
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { ILoginService } from './login.service.interface';
import { inject } from '@angular/core';
import { UserType } from '../../models/user/user.model';
import { ITenantService } from 'src/app/common/sevices/tenant-service/tenant.service.interface';



export const hasRoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router: Router = inject(Router);
    const userRole: UserType | null = inject(ILoginService).getUserRole();
    if (userRole) {
        const expectedRoles: UserType[] = route.data['roles'];
        const hasRole: boolean = expectedRoles.some((role) => userRole <= role);
        return hasRole || router.navigate(['/unauthorized']);
    }
    return router.navigate(['/unauthorized']);
};

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router: Router = inject(Router);
    return inject(ILoginService).isAuthenticated()
        ? true
        : router.navigate(['/unauthorized']);
}

export const TenantGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

    const router: Router = inject(Router);
    if (inject(ITenantService).getTenant()) {
        return true;
    } else {
        router.navigate(['/']);
        return false;
    }
}