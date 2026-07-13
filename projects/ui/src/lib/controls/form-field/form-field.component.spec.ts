import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field.component';
import {FormControl, Validators} from '@angular/forms';
import {TranslateModule} from "@ngx-translate/core";
import {ChangeDetectorRef} from "@angular/core";

describe('FormFieldComponent', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormFieldComponent,
        TranslateModule.forRoot() ],
    });

    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('control', new FormControl());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('hasError()', () => {
    it('should return TRUE when control is invalid and touched', () => {
      const testControl = new FormControl('', Validators.required);
      testControl.markAsTouched();

      fixture.componentRef.setInput('control', testControl);
      fixture.detectChanges();

      expect(component.hasError()).toBe(true);
    });

    it('should return FALSE when control is invalid but NOT touched', () => {
      const testControl = new FormControl('', Validators.required);
      fixture.componentRef.setInput('control', testControl);
      fixture.detectChanges();

      expect(component.hasError()).toBe(false);
    });

    it('should return FALSE when control is valid and touched', () => {
      const testControl = new FormControl('some value', Validators.required);
      fixture.componentRef.setInput('control', testControl);
      fixture.detectChanges();

      expect(component.hasError()).toBe(false);
    });
  });

  describe('errorKey getter', () => {
    it('should return the error key when control has an error', () => {
      const testControl = new FormControl('', Validators.required);
      fixture.componentRef.setInput('control', testControl);
      fixture.detectChanges();

      expect(component.errorKey).toBe('required');
    });

    it('should return "pattern" for a pattern error', () => {
      const testControl = new FormControl('invalid-value', Validators.pattern('[0-9]+'));
      fixture.componentRef.setInput('control', testControl);
      fixture.detectChanges();

      expect(component.errorKey).toBe('pattern');
    });

    it('should return null when control is valid', () => {
      const testControl = new FormControl('valid value');
      fixture.componentRef.setInput('control', testControl);
      fixture.detectChanges();

      expect(component.errorKey).toBeNull();
    });
  });

  describe('Test effect', () => {
    it('should react to control value changes and trigger markForCheck', () => {
      const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
      const markForCheckSpy = jest.spyOn(cdr, 'markForCheck');

      const testControl = new FormControl('');
      fixture.componentRef.setInput('control', testControl);
      fixture.detectChanges();
      markForCheckSpy.mockClear();

      testControl.setValue('new value');
      expect(markForCheckSpy).toHaveBeenCalled();
    });
  });
});