import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BasicInputComponent} from './basic-input.component';

describe('BasicInputComponent', () => {
  let fixture: ComponentFixture<BasicInputComponent<string | number | null>>;
  beforeEach(() => {
    TestBed.configureTestingModule({imports: [BasicInputComponent]});
    fixture = TestBed.createComponent(BasicInputComponent);
    fixture.detectChanges();
  });

  it('emits input changes and marks blur as touched', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const changed = jest.fn();
    fixture.componentInstance.changed.subscribe(changed);
    input.value = 'Pasted value';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('Pasted value');
    expect(changed).toHaveBeenCalledWith('Pasted value');
    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('uses native numeric values and returns null for an empty or invalid number', () => {
    fixture.componentRef.setInput('type', 'number');
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '42.5';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe(42.5);
    for (const value of ['', 'invalid']) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
      expect(fixture.componentInstance.value()).toBeNull();
    }
  });

  it('forwards native attributes and associates the label with the input', () => {
    for (const [name, value] of Object.entries({type: 'email', inputId: 'email', label: 'Email', readonly: true, disabled: true, autocomplete: 'email', lang: 'ru', spellcheck: false, ariaDescribedBy: 'hint'})) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.id).toBe('email');
    expect(input.type).toBe('email');
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(input.getAttribute('aria-describedby')).toBe('hint');
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe('email');
  });

  it('updates and removes autocapitalize on the native input', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.hasAttribute('autocapitalize')).toBe(false);
    for (const value of ['off', 'sentences']) {
      fixture.componentRef.setInput('autocapitalize', value);
      fixture.detectChanges();
      expect(input.getAttribute('autocapitalize')).toBe(value);
    }
    fixture.componentRef.setInput('autocapitalize', undefined);
    fixture.detectChanges();
    expect(input.hasAttribute('autocapitalize')).toBe(false);
  });
});
