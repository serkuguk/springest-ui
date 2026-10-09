import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarComponent } from './calendar.component';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
it('labels the actual date input and forwards accessible errors and readonly', () => {
    fixture.componentRef.setInput('ariaDescribedBy', 'hint');
    fixture.componentRef.setInput('ariaInvalid', true);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toBe('hint');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
  });
});
