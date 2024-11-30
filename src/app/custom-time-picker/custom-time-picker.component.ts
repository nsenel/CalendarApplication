import { Component, forwardRef, OnInit, ViewChild, ElementRef, AfterViewInit, Input, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-time-picker',
  templateUrl: './custom-time-picker.component.html',
  styleUrls: ['./custom-time-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTimePickerComponent),
      multi: true,
    },
  ],
})
export class CustomTimePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  @ViewChild('hourScroll', { static: false }) hourScroll?: ElementRef;
  @ViewChild('minuteScroll', { static: false }) minuteScroll?: ElementRef;
  @ViewChild('pickerContainer', { static: false }) pickerContainer?: ElementRef;
  @Input() hourEnabled: boolean = true;
  @Input() minuteEnabled: boolean = true;
  @Input() minutes: number[] = [0,5,10,15,20,25,30,35,40,45,50,55];

  hours: number[] = [];
  selectedHour: number = 0;
  selectedMinute: number = 0;
  showClock: boolean = false;

  public disabled: boolean = false;  // Internal disabled state

  private onChange?: (value: string) => void;
  private onTouched?: () => void;

  ngOnInit() {
    this.hours = Array.from({ length: 23 }, (_, i) => i + 1); // 12-hour clock
  }

  ngAfterViewInit() {
    if (this.hourEnabled) {
      this.scrollToSelected('hour');
    }
    if (this.minuteEnabled) {
      this.scrollToSelected('minute');
    }
  }

  get formattedTime(): string {
    if (this.hourEnabled && !this.minuteEnabled) {
      return `${this.selectedHour.toString().padStart(2, '0')}`;
    } else if (!this.hourEnabled && this.minuteEnabled) {
      return `${this.selectedMinute.toString().padStart(2, '0')}`;
    }
    return `${this.selectedHour.toString().padStart(2, '0')}:${this.selectedMinute.toString().padStart(2, '0')}`;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    if (this.showClock && this.pickerContainer && !this.pickerContainer.nativeElement.contains(targetElement)) {
      this.showClock = false;  // Close the picker
    }
  }

  writeValue(value: string): void {
    if (value) {
      const [hour, minute] = value.split(':').map(Number);
      this.selectedHour = hour;
      this.selectedMinute = minute;
      this.scrollToSelected('hour');
      this.scrollToSelected('minute');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.showClock) {
      this.toggleClock()
    }
    this.disabled = isDisabled;
  }

  toggleClock() {
    if (this.disabled) return;
    this.showClock = !this.showClock;
    if (this.showClock) {
      setTimeout(() => {
        this.scrollToSelected('hour');
        this.scrollToSelected('minute');
      });
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  setHour(hour: number) {
    if (this.disabled) return;  // Prevent setting if disabled
    this.selectedHour = hour;
    this.scrollToSelected('hour');
    this.notifyChange();
    if (this.onTouched) {
      this.onTouched();
    }
  }

  setMinute(minute: number) {
    if (this.disabled) return;  // Prevent setting if disabled
    this.selectedMinute = minute;
    this.scrollToSelected('minute');
    this.notifyChange();
    if (this.onTouched) {
      this.onTouched();
    }
  }

  confirmTime() {
    if (this.disabled) return;  // Prevent confirming if disabled
    this.showClock = false;
    if (this.onTouched) {
      this.onTouched();
    }
  }

  private scrollToSelected(type: 'hour' | 'minute') {
    const element = type === 'hour' ? this.hourScroll?.nativeElement : this.minuteScroll?.nativeElement;
    const selected = type === 'hour' ? this.selectedHour : this.selectedMinute;
    const index = type === 'hour' ? this.hours.indexOf(selected) : this.minutes.indexOf(selected);
    const offset = 40;
    if (element) {
      element.scrollTop = index * offset;
    }
  }

  private notifyChange() {
    const value = `${this.selectedHour.toString().padStart(2, '0')}:${this.selectedMinute.toString().padStart(2, '0')}`;
    if (this.onChange) {
      this.onChange(value);
    }
  }
}
