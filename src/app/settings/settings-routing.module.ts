import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { authGuard, hasRoleGuard } from '../common/components/user/sevices/login/auth.guard';
import { UserType } from '../common/components/user/models/user/user.model';

const routes: Routes = [
  { path: '', component: SettingsComponent, canActivate: [hasRoleGuard], data: {
    roles: [ UserType.PRODUCT_OWNER, UserType.ADMIN, UserType.REGULAR ]
  } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
