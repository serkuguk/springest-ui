import {ComponentFixture, TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {FormFieldComponent} from './form-field.component';

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({imports: [FormFieldComponent]});
    fixture = TestBed.createComponent(FormFieldComponent);
  });

  it('renders errors only after touch or submission and clears them after reset', () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('field', control);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-field__error')).toBeNull();
    control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-field__error').textContent).toBe('Required field');
    control.reset();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-field__error')).toBeNull();
    fixture.componentRef.setInput('submitted', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasError()).toBe(true);
    control.setValue('valid');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-field__error')).toBeNull();
  });

  it('releases old control events when field is replaced and on destruction', () => {
    const first = new FormControl('');
    const second = new FormControl('');
    const subscribe = jest.spyOn(first.events, 'subscribe');
    fixture.componentRef.setInput('field', first);
    fixture.detectChanges();
    const subscription = subscribe.mock.results[0].value;
    fixture.componentRef.setInput('field', second);
    fixture.detectChanges();
    expect(subscription.closed).toBe(true);
    const secondSubscribe = jest.spyOn(second.events, 'subscribe');
    fixture.componentRef.setInput('field', first);
    fixture.detectChanges();
    fixture.componentRef.setInput('field', second);
    fixture.detectChanges();
    const secondSubscription = secondSubscribe.mock.results[0].value;
    fixture.destroy();
    expect(secondSubscription.closed).toBe(true);
  });

  it('uses Signal Forms length parameters, message and override precedence', () => {
    const errors = signal([{kind: 'minLength', minLength: 8, message: ''}]);
    fixture.componentRef.setInput('field', () => ({invalid: signal(true), touched: signal(true), errors}));
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage).toBe('At least 8 characters');
    errors.set([{kind: 'minLength', minLength: 8, message: 'Validator message'}]);
    expect(fixture.componentInstance.errorMessage).toBe('Validator message');
    fixture.componentRef.setInput('errorMessages', {minLength: (error: Record<string, unknown>) => `Minimum ${error['minLength']}`});
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage).toBe('Minimum 8');
  });

  it('supports reactive length errors and merges unique accessible IDs', () => {
    const control = new FormControl('a', Validators.minLength(8));
    control.markAsTouched();
    fixture.componentRef.setInput('field', control);
    fixture.componentRef.setInput('showLabel', true);
    fixture.componentRef.setInput('label', 'Name');
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.errorMessage).toBe('At least 8 characters');
    expect(component.describedBy(`hint hint ${component.errorId()}`)).toBe(`hint ${component.errorId()}`);
    expect(component.labelledBy('external')).toBe(`external ${component.labelId()}`);
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(component.controlId());
    const other = TestBed.createComponent(FormFieldComponent);
    other.componentRef.setInput('field', new FormControl());
    expect(other.componentInstance.controlId()).not.toBe(component.controlId());
  });
});
