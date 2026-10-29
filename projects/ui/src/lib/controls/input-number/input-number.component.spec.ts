import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {disabled, form, FormField, max, min, readonly, required} from '@angular/forms/signals';
import {
  InputNumberComponent, FormFieldComponent, ProgressSpinner, Tooltip, Popover, ConfirmPopup,
  ConfirmationService, Accordion, AccordionPanel, AccordionHeader, AccordionContent,
} from '../../../public-api';

@Component({
  imports: [InputNumberComponent, FormFieldComponent, FormField, ProgressSpinner, Tooltip, Popover,
    ConfirmPopup, Accordion, AccordionPanel, AccordionHeader, AccordionContent],
  providers: [ConfirmationService],
  template: `
    <app-form-field [field]="fields.amount" label="Amount" [showLabel]="true">
      <app-input-number [formField]="fields.amount" locale="en-US" [step]="0.5" [maxFractionDigits]="2"
        (changed)="changes.push($event)" />
    </app-form-field>
    <app-input-number [(value)]="standalone" label="Price" mode="currency" currency="EUR" locale="de-DE" />
    <p-progress-spinner ariaLabel="Loading" />
    <button pTooltip="Help" tooltipEvent="focus" (click)="popover.toggle($event)">Help</button>
    <p-popover #popover><button>Inside</button></p-popover>
    <p-confirmpopup />
    <p-accordion [(value)]="active">
      <p-accordion-panel value="one">
        <p-accordion-header>Details</p-accordion-header>
        <p-accordion-content>Content</p-accordion-content>
      </p-accordion-panel>
    </p-accordion>
  `,
})
class Host {
  readonly blocked = signal(false);
  readonly readOnly = signal(false);
  readonly data = signal({amount: null as number | null});
  readonly fields = form(this.data, p => {
    required(p.amount);
    min(p.amount, -10);
    max(p.amount, 10);
    disabled(p.amount, () => this.blocked());
    readonly(p.amount, () => this.readOnly());
  });
  readonly standalone = signal<number | null>(12.5);
  active: string | number | string[] | number[] | undefined = 'one';
  changes: (number | null)[] = [];
}

describe('InputNumber and official exports', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const controls = fixture.debugElement.queryAll(By.directive(InputNumberComponent));
    const input = controls[0].nativeElement.querySelector('input') as HTMLInputElement;
    return {fixture, host: fixture.componentInstance, controls, input};
  }

  it('renders official components and integrates labels, validation and schema bounds', async () => {
    const {fixture, host, input, controls} = await setup();
    const control = controls[0].componentInstance as InputNumberComponent;
    expect(control.min()).toBe(-10);
    expect(control.max()).toBe(10);
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.fields.amount().touched()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain('-error');
    expect(fixture.nativeElement.textContent).toContain('Required field');
    expect(fixture.nativeElement.querySelector('p-accordion')).not.toBeNull();
  });

  it('accepts zero, negative/fractional numbers and clearing through the native input', async () => {
    const {fixture, host, input} = await setup();
    for (const [text, expected] of [['0', 0], ['-2.5', -2.5], ['', null]] as const) {
      input.value = text;
      input.dispatchEvent(new Event('input', {bubbles: true}));
      input.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(host.data().amount).toBe(expected);
      expect(host.changes.at(-1)).toBe(expected);
    }
  });

  it('focuses the native number input and forwards focus options', async () => {
    const {controls, input} = await setup();
    const focus = jest.spyOn(input, 'focus');
    const options = {preventScroll: true};
    (controls[0].componentInstance as InputNumberComponent).focus(options);
    expect(focus).toHaveBeenCalledWith(options);
    expect(document.activeElement).toBe(input);
  });

  it('supports two-way reset, currency formatting, disabled and readonly', async () => {
    const {fixture, host, input, controls} = await setup();
    const standaloneInput = controls[1].nativeElement.querySelector('input') as HTMLInputElement;
    expect(standaloneInput.value).toContain('12,50');
    host.standalone.set(null);
    host.blocked.set(true);
    await fixture.whenStable();
    expect(standaloneInput.value).toBe('');
    expect(input.disabled).toBe(true);
    const control = controls[0].componentInstance as InputNumberComponent;
    control.onValueChange(3);
    expect(host.data().amount).toBeNull();
    host.blocked.set(false);
    host.readOnly.set(true);
    await fixture.whenStable();
    expect(input.readOnly).toBe(true);
    control.onValueChange(4);
    expect(host.data().amount).toBeNull();
    host.readOnly.set(false);
    await fixture.whenStable();
    (controls[1].componentInstance as InputNumberComponent).onValueChange(0);
    await fixture.whenStable();
    expect(host.standalone()).toBe(0);
  });
});
