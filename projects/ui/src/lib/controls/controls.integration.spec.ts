import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl, Validators} from '@angular/forms';
import {disabled, email, form, FormField, max, maxLength, min, minLength, readonly, required, submit, validate} from '@angular/forms/signals';
import {
  BasicInputComponent, BasicSelectComponent, ButtonComponent, CalendarComponent, CheckboxComponent,
  DialogComponent, FilePickerComponent, FormFieldComponent, MultiSelectComponent, PaginationComponent,
  PasswordInputComponent, SegmentedControlComponent, TextareaComponent, ToggleComponent, Value,
} from '../../public-api';

@Component({
  imports: [FormField, FormFieldComponent, BasicInputComponent, BasicSelectComponent, ButtonComponent,
    CalendarComponent, CheckboxComponent, DialogComponent, FilePickerComponent, MultiSelectComponent,
    PaginationComponent, PasswordInputComponent, SegmentedControlComponent, TextareaComponent, ToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span id="hint">Helpful description</span>
    <app-form-field data-control="text" [field]="fields.text" label="Name" [showLabel]="true" [submitted]="submitted()">
      <app-basic-input [formField]="fields.text" [autocapitalize]="'off'" ariaDescribedBy="hint" (changed)="textChanged = $event" />
    </app-form-field>
    <app-form-field data-control="number" [field]="fields.amount" label="Amount" [showLabel]="true" [submitted]="submitted()">
      <app-basic-input type="number" [formField]="fields.amount" [step]="0.5"
        (changed)="numberChanged = $event" />
    </app-form-field>
    <app-form-field data-control="email" [field]="fields.email" [submitted]="submitted()">
      <app-basic-input type="email" label="Email" [formField]="fields.email" />
    </app-form-field>
    <app-form-field data-control="textarea" [field]="fields.note" label="Note" [showLabel]="true" [submitted]="submitted()">
      <app-textarea [formField]="fields.note" />
    </app-form-field>
    <app-form-field data-control="file" [field]="fields.files" label="Files" [showLabel]="true" [submitted]="submitted()">
      <app-file-picker [formField]="fields.files" [multiple]="true" />
    </app-form-field>
    <app-form-field data-control="toggle" [field]="fields.enabled" label="Enabled" [showLabel]="true" [submitted]="submitted()">
      <app-toggle [formField]="fields.enabled" />
    </app-form-field>
    <app-form-field data-control="segmented" [field]="fields.choice" label="Choice" [showLabel]="true" [submitted]="submitted()">
      <app-segmented-control [formField]="fields.choice" [items]="items" variant="cards">
        <ng-template #item let-item let-selected="selected"><span data-card>{{ item.label }} {{ selected ? 'Selected' : '' }}</span></ng-template>
      </app-segmented-control>
    </app-form-field>
    <app-form-field data-control="select" [field]="fields.selection" label="Selection" [showLabel]="true" [submitted]="submitted()">
      <app-basic-select [formField]="fields.selection" [items]="items" optionLabel="label" optionValue="value" />
    </app-form-field>
    <app-form-field data-control="multi" [field]="fields.many" label="Many" [showLabel]="true" [submitted]="submitted()">
      <app-multi-select [formField]="fields.many" [items]="items" />
    </app-form-field>
    <app-form-field data-control="password" [field]="fields.password" label="Password" [showLabel]="true" [submitted]="submitted()">
      <app-password-input [formField]="fields.password" [autocomplete]="'current-password'" />
    </app-form-field>
    <app-form-field data-control="checkbox" [field]="fields.checked" label="Checked" [showLabel]="true" [submitted]="submitted()">
      <app-checkbox [formField]="fields.checked" />
    </app-form-field>
    <app-form-field data-control="calendar" [field]="fields.date" label="Date" [showLabel]="true" [submitted]="submitted()">
      <global-calendar [formField]="fields.date" />
    </app-form-field>
    <app-button [loading]="busy()" [aria]="{'aria-label': 'Save'}"><span>Save form</span></app-button>
    <app-dialog [(visible)]="visible" header="Confirm" [closable]="true" [closeOnEscape]="true"
      [dismissableMask]="false" [closeAriaLabel]="'Закрыть'"><p>Body</p><app-button dialogActions label="Done" (click)="visible.set(false)" /></app-dialog>
    <app-pagination [(first)]="first" [(rows)]="rows" [totalRecords]="25" [rowsPerPageOptions]="[10, 20]" />
  `,
})
class ControlsHost {
  readonly submitted = signal(false);
  readonly blocked = signal(false);
  readonly readOnly = signal(false);
  readonly busy = signal(false);
  readonly visible = signal(false);
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly items = [{label: 'One', value: 'one'}, {label: 'Two', value: 'two'}];
  readonly values = signal({text: '', email: '', amount: null as number | null, note: '', files: [] as File[],
    enabled: false, choice: null as Value | null, selection: null as Value | null, many: [] as Value[],
    password: '', checked: false, date: null as Date | null});
  readonly fields = form(this.values, path => {
    required(path.text, {message: 'Name required'});
    minLength(path.text, 8, {message: 'Minimum 8 characters'});
    disabled(path.text, () => this.blocked());
    readonly(path.text, () => this.readOnly());
    required(path.email);
    email(path.email);
    required(path.amount);
    min(path.amount, 1);
    max(path.amount, 100);
    required(path.note);
    maxLength(path.note, 100);
    validate(path.files, context => context.value().length ? null : {kind: 'required'});
    validate(path.enabled, context => context.value() ? null : {kind: 'required'});
    required(path.choice);
    required(path.selection);
    validate(path.many, context => context.value().length ? null : {kind: 'required'});
    required(path.password);
    validate(path.checked, context => context.value() ? null : {kind: 'required'});
    required(path.date);
  });
  textChanged = '';
  numberChanged: number | null = null;
}

@Component({
  imports: [FormFieldComponent, TextareaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-form-field [field]="control()" label="Legacy note" [showLabel]="true">
    <app-textarea ariaDescribedBy="hint" />
  </app-form-field>`,
})
class ReactiveHost {
  readonly control = signal(new FormControl('', Validators.required));
}

describe('Signal Forms library integration', () => {
  it('updates projected ARIA when a Reactive Forms control is touched, corrected or replaced', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    fixture.componentInstance.control().markAsTouched();
    fixture.detectChanges();
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.getAttribute('aria-describedby')).toContain('-error');
    fixture.componentInstance.control().setValue('Valid');
    fixture.detectChanges();
    expect(textarea.getAttribute('aria-invalid')).toBe('false');
    expect(textarea.getAttribute('aria-describedby')).toBe('hint');
    fixture.componentInstance.control.set(new FormControl('', Validators.required));
    fixture.detectChanges();
    fixture.componentInstance.control().markAsTouched();
    fixture.detectChanges();
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });
  async function mount() {
    const fixture = TestBed.createComponent(ControlsHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const root: HTMLElement = fixture.nativeElement;
    const control = (name: string, selector = 'input') => root.querySelector(`[data-control="${name}"] ${selector}`)! as HTMLElement;
    return {fixture, host, root, control};
  }

  it('shows errors after blur, preserves descriptions, and removes errors after correction/reset', async () => {
    const {fixture, host, root, control} = await mount();
    expect(root.querySelector('.form-field__error')).toBeNull();
    const input = control('text') as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toBe('hint');
    const labelId = input.getAttribute('aria-labelledby')!;
    expect(root.querySelector(`[id="${labelId}"]`)?.textContent).toContain('Name');
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.fields.text().touched()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const errorId = input.getAttribute('aria-describedby')!.split(' ')[1];
    expect(root.querySelector(`[id="${errorId}"]`)?.textContent).toContain('Name required');
    input.value = 'short';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelector(`[id="${errorId}"]`)?.textContent).toContain('Minimum 8 characters');
    input.value = 'Long enough';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.textChanged).toBe('Long enough');
    expect(input.getAttribute('aria-invalid')).not.toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('hint');
    host.fields().reset();
    fixture.detectChanges();
    expect(root.querySelector('.form-field__error')).toBeNull();
  });

  it('keeps numeric values numeric and clears to null', async () => {
    const {fixture, host, control} = await mount();
    const input = control('number') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.min).toBe('1');
    expect(input.max).toBe('100');
    expect(input.step).toBe('0.5');
    input.value = '12.5';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.values().amount).toBe(12.5);
    expect(host.numberChanged).toBe(12.5);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.values().amount).toBeNull();
    expect(host.numberChanged).toBeNull();
  });

  it('links every existing and new control to its visible error on submission', async () => {
    const {fixture, host, root, control} = await mount();
    host.submitted.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const selectors: Record<string, string> = {textarea: 'textarea', select: '[role="combobox"]',
      multi: 'input', segmented: '[role="group"]'};
    for (const name of ['text', 'number', 'email', 'textarea', 'file', 'toggle', 'segmented', 'select', 'multi', 'password', 'checkbox', 'calendar']) {
      const field = control(name, selectors[name] ?? 'input');
      expect(field).toBeTruthy();
      expect({name, invalid: field.getAttribute('aria-invalid')}).toEqual({name, invalid: 'true'});
      const ids = field.getAttribute('aria-describedby')!.split(/\s+/);
      expect(ids.some(id => root.querySelector(`[id="${id}"]`)?.classList.contains('form-field__error'))).toBe(true);
    }
    const ids = Array.from(root.querySelectorAll('[id]')).map(element => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('honors Signal Forms disabled/readonly and submit() touches untouched fields', async () => {
    const {fixture, host, control} = await mount();
    host.blocked.set(true);
    fixture.detectChanges();
    expect((control('text') as HTMLInputElement).disabled).toBe(true);
    host.blocked.set(false);
    host.readOnly.set(true);
    fixture.detectChanges();
    expect((control('text') as HTMLInputElement).readOnly).toBe(true);
    host.readOnly.set(false);
    fixture.detectChanges();
    const action = jest.fn();
    await submit(host.fields, action);
    fixture.detectChanges();
    expect(action).not.toHaveBeenCalled();
    expect(host.fields.text().touched()).toBe(true);
    expect(control('text').getAttribute('aria-invalid')).toBe('true');
  });
});
