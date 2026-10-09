import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordInputComponent } from './password-input.component';

describe('PasswordInputComponent', () => {
  let component: PasswordInputComponent;
  let fixture: ComponentFixture<PasswordInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates and removes autocomplete on the native password input', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.hasAttribute('autocomplete')).toBe(false);
    for (const value of ['current-password', 'new-password']) {
      fixture.componentRef.setInput('autocomplete', value);
      fixture.detectChanges();
      expect(input.getAttribute('autocomplete')).toBe(value);
    }
    fixture.componentRef.setInput('autocomplete', undefined);
    fixture.detectChanges();
    expect(input.hasAttribute('autocomplete')).toBe(false);
  });
it('updates pasted input, emits changes and marks the actual input touched on blur', () => {
    const changed = jest.fn();
    component.changed.subscribe(changed);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'pasted-password';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    input.dispatchEvent(new Event('blur'));
    expect(component.value()).toBe('pasted-password');
    expect(changed).toHaveBeenCalledWith('pasted-password');
    expect(component.touched()).toBe(true);
  });

  it('forwards descriptions and readonly to the native password input', () => {
    fixture.componentRef.setInput('ariaDescribedBy', 'hint');
    fixture.componentRef.setInput('ariaInvalid', true);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toBe('hint');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.readOnly).toBe(true);
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
  });
});
