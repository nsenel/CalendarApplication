import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { environment } from 'src/environment/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DayComponent } from './calendar/components/day/day.component';
import { AppointmentFormComponent } from './calendar/components/appointment-form/appointment-form.component';
import { CustomTimePickerComponent } from './custom-time-picker/custom-time-picker.component';
import { CalendarComponent } from './calendar/calendar.component';
import { IAppointmentService } from './calendar/services/appointment-service/appointment.service.interface';
import { AppointmentMockService } from './calendar/services/appointment-service/appointment.service.mock';
import { AppointmentService } from './calendar/services/appointment-service/appointment.service';
import { NotificationComponent } from './common/components/notification/components/notification/notification.component';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { NotificationService } from './common/components/notification/sevices/notification/notification.service';
import { ILoginService } from './common/components/user/sevices/login/login.service.interface';
import { LoginFormComponent } from './common/components/user/components/login-form/login-form.component';
import { UserComponent } from './common/components/user/components/user/user.component';
import { LoginMockService } from './common/components/user/sevices/login/login.service.mock';
import { LoginService } from './common/components/user/sevices/login/login.service';
import { CustomDatePickerComponent } from './custom-date-picker/custom-date-picker.component';
import { SettingsComponent } from './settings/settings.component';
import { IUserSettingsService } from './settings/services/user-settings/user-settings.service.interface';
import { UserSettingsMockService } from './settings/services/user-settings/user-settings.service.mock';
import { UserSettingsService } from './settings/services/user-settings/user-settings.service';
import { IOwnerSettingsService } from './settings/services/owner-settings/owner-settings.service.interface';
import { OwnerSettingsMockService } from './settings/services/owner-settings/owner-settings.service.mock';
import { OwnerSettingsService } from './settings/services/owner-settings/owner-settings.service';
import { ICalendarSettingsService } from './settings/services/calendar-settings/calendar-settings.service.interface';
import { CalendarSettingsMockService } from './settings/services/calendar-settings/calendar-settings.service.mock';
import { CalendarSettingsService } from './settings/services/calendar-settings/calendar-settings.service';
import { UserSettingsComponent } from './settings/components/user-settings/user-settings.component';
import { CalendarSettingsComponent } from './settings/components/calendar-settings/calendar-settings.component';
import { FooterComponent } from './footer/footer.component';
import { OwnerSettingsComponent } from './settings/components/owner-settings/owner-settings.component';
import { ITenantService } from './common/sevices/tenant-service/tenant.service.interface';
import { TenantService } from './common/sevices/tenant-service/tenant.service';
import { TenantMockService } from './common/sevices/tenant-service/tenant.service.mock';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    DayComponent,
    AppointmentFormComponent,
    CustomTimePickerComponent,
    CalendarComponent,
    NotificationComponent,
    HomeComponent,
    HeaderComponent,
    LoginFormComponent,
    UserComponent,
    CustomDatePickerComponent,
    SettingsComponent,
    UserSettingsComponent,
    CalendarSettingsComponent,
    FooterComponent,
    OwnerSettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot([]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    AppRoutingModule
  ],
  providers: [
    NotificationService,
    TenantService,
    {
      provide: ITenantService,
      useClass: environment.useMockService ? TenantMockService : TenantService
    },
    {
      provide: IAppointmentService,
      //useClass: AppointmentService
      useClass: environment.useMockService ? AppointmentMockService : AppointmentService
    },
    {
      provide: ILoginService,
      //useClass: LoginService //environment.useMockService ? LoginMockService : 
      useClass: environment.useMockService ? LoginMockService : LoginService
    }
    ,
    {
      provide: IUserSettingsService,
      useClass: environment.useMockService ? UserSettingsMockService : UserSettingsService
    },
    {
      provide: ICalendarSettingsService,
      //useClass: CalendarSettingsService //environment.useMockService ? CalendarSettingsMockService :
      useClass: environment.useMockService ? CalendarSettingsMockService : CalendarSettingsService
    },
    {
      provide: IOwnerSettingsService,
      useClass: environment.useMockService ? OwnerSettingsMockService : OwnerSettingsService
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
