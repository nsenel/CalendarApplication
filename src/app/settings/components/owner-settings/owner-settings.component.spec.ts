import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerSettingsComponent } from './owner-settings.component';

describe('OwnerSettingsComponent', () => {
  let component: OwnerSettingsComponent;
  let fixture: ComponentFixture<OwnerSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OwnerSettingsComponent]
    });
    fixture = TestBed.createComponent(OwnerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
