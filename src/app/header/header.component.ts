import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ITenantService } from '../common/sevices/tenant-service/tenant.service.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  
  @Input() isDarkMode: boolean = false;
  @Input() language: string = "en";
  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() languageChange = new EventEmitter<string>();

  constructor(public tenantService: ITenantService, public translateSevice: TranslateService, private translateService:TranslateService ) {
    this.translateService.addLangs(['en', 'de']);
    this.translateService.setDefaultLang('en');
  }

  onThemaChange() {
    this.darkModeChange.emit(this.isDarkMode);
  }

  toggleLanguage(event: Event): void {
    // Toggle the language value based on the checkbox state
    this.language = (event.target as HTMLInputElement).checked ? 'de' : 'en';
    this.translateService.use(this.language);
  }
}
