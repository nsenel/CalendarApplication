import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTimePickerComponent } from './custom-time-picker.component';

describe('CustomTimePickerComponent', () => {
  let component: CustomTimePickerComponent;
  let fixture: ComponentFixture<CustomTimePickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomTimePickerComponent]
    });
    fixture = TestBed.createComponent(CustomTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
