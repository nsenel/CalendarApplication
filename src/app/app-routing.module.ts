import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantGuard } from './common/components/user/sevices/login/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { path: 'home', loadChildren: () => import('./home/home-routing.module').then(m => m.HomeRoutingModule) },
  { path: 'calendar', loadChildren: () => import('./calendar/calendar-routing.module').then(m => m.calendarRoutingModule), canActivate: [TenantGuard] },
  { path: 'settings', loadChildren: () => import('./settings/settings-routing.module').then(m => m.SettingsRoutingModule), canActivate: [TenantGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
