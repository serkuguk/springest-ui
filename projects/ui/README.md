# springest

Standalone UI components for Angular 21.2, PrimeNG 21 and Signal Forms.

## Install

```sh
npm install springest@0.2.0 primeng@^21.1.0 @ngx-translate/core@^15.0.0 chart.js@^4.5.0
```

Angular common/core/forms (^21.2.0) and RxJS (^7.8.0) are peer dependencies and must be provided by the application. Angular Signal Forms are experimental in Angular 21; this package targets that version. Configure a PrimeNG theme in your application.

```ts
import { ButtonComponent, BasicSelectComponent } from 'springest';
```

BasicSelect supports a scalar or null value. Use object options with `optionLabel` (default: `name`) and `optionValue` to select a property. Bind with Angular Signal Forms `[formField]` or two-way `[(value)]`. `changed` emits the selected value, blur marks the field touched, and `closed` emits when the popup closes.

## Fields and validation

`BasicInputComponent`, `TextareaComponent`, `FilePickerComponent`, `ToggleComponent`, and `SegmentedControlComponent` support `[formField]` or `[(value)]`, `changed`, `touched`, `disabled`, and `readonly`. Validation belongs in your form schema. `FormFieldComponent` also accepts an existing Reactive Forms `AbstractControl`.

```ts
import {Component, signal} from '@angular/core';
import {email, form, FormField, max, maxLength, min, minLength, required, submit} from '@angular/forms/signals';
import {BasicInputComponent, FormFieldComponent, TextareaComponent} from 'springest';

@Component({
  imports: [FormField, FormFieldComponent, BasicInputComponent, TextareaComponent],
  template: `
    <form novalidate (submit)="$event.preventDefault(); save()">
      <app-form-field [field]="fields.email" label="Email" [showLabel]="true" [submitted]="submitted()">
        <app-basic-input type="email" [formField]="fields.email" autocomplete="email" />
      </app-form-field>
      <app-form-field [field]="fields.amount" label="Amount" [showLabel]="true" [submitted]="submitted()">
        <app-basic-input type="number" [formField]="fields.amount" [step]="1" />
      </app-form-field>
      <app-form-field [field]="fields.note" [submitted]="submitted()">
        <app-textarea label="Note" [formField]="fields.note" [rows]="4" />
      </app-form-field>
      <button type="submit">Save</button>
    </form>
  `,
})
export class Editor {
  readonly submitted = signal(false);
  readonly data = signal({email: '', amount: null as number | null, note: ''});
  readonly fields = form(this.data, path => {
    required(path.email, {message: 'Email is required'});
    email(path.email, {message: 'Enter a valid email'});
    min(path.amount, 1, {message: 'Number must be between 1 and 100'});
    max(path.amount, 100, {message: 'Number must be between 1 and 100'});
    minLength(path.note, 8, {message: 'Minimum 8 characters'});
    maxLength(path.note, 500);
  });
  async save() {
    this.submitted.set(true);
    await submit(this.fields, async () => { console.log(this.data()); });
  }
}
```

Input `type` accepts `text` (default), `email`, `search`, or `number`. Text types emit strings; number emits `number | null`, with an empty field represented by `null`. Initialize numeric form/two-way values with `null` or a number. For two-way `[(value)]`, `min`, `max`, and `step` are native input attributes. With `[formField]`, configure `min`, `max`, and `maxLength` in the schema: Angular supplies them to the control and rejects simultaneous property bindings. `step` can still be supplied directly. Input also forwards `autocomplete`, `lang`, `spellcheck`, `readonly`, and both `disabled` and the existing `isDisabled`. The existing `placeholder` remains the fallback floating label when `label` is omitted.

FormField displays the first error after touch or when `submitted` is true. Angular `submit()` also marks invalid fields touched. Reset your `submitted` signal when starting a fresh form. Messages prefer `errorMessages` overrides, then the validator's `message`, then English defaults. The existing `ERRORS.FIELD_REQUIRED` translation is used when available. Override entries can be text or a function receiving the error parameters:

```html
<app-form-field [field]="fields.note"
  [errorMessages]="{required: 'Обязательное поле', minLength: 'Минимум 8 символов'}">
  <app-textarea [formField]="fields.note" label="Описание" />
</app-form-field>
```

Use one control per FormField. The wrapper owns its `controlId`, label and error IDs; outside it, controls use a unique `inputId` which you can override. Controls expose `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`, and `ariaInvalid`. Descriptions preserve your supplied IDs and append the visible error ID. Labels and errors reach the internal native/focusable element, including Select, MultiSelect, Password, Checkbox and Calendar (`global-calendar`). Readonly disables selection in Select/MultiSelect and blocks date selection as well as typing in Calendar.

## Files, switches and segmented choices

```html
<app-file-picker label="Attachments" [(value)]="files" accept=".pdf,image/*" [multiple]="true" />
<app-toggle label="Notifications" [(value)]="notifications" />
<app-segmented-control label="Plan" [items]="plans" [(value)]="plan" variant="cards">
  <ng-template #item let-item let-selected="selected">
    <strong>{{ item.label }}</strong>
    <span>{{ selected ? 'Selected' : 'Choose this plan' }}</span>
  </ng-template>
</app-segmented-control>
```

Import `FilePickerComponent`, `ToggleComponent`, and `SegmentedControlComponent` in the consuming standalone component. Initialize `files` as `File[] = []`, notifications as a boolean, and plan as `Value | null`. `plans` uses the existing `ControlItemInterface[]`, for example `[{label: 'Basic', value: 'basic'}, {label: 'Pro', value: 'pro'}]`.

FilePicker selects local files and displays their names. Default selection is a single file; clearing or resetting to `[]` also clears the native picker, allowing the same file to be selected again. Cancelling the picker preserves the current selection. `accept` is a browser hint; validate files before upload in your application.

SegmentedControl selects one scalar value and defaults to `variant="segments"`. `allowEmpty` defaults to false, so clicking the selected item keeps it selected. Cards use the same keyboard behavior and can project `#item` with `$implicit: ControlItemInterface` and `selected: boolean` (`SegmentedControlItemContext`). Readonly disables interaction in Toggle and SegmentedControl.

## Buttons, dialog and pagination

```html
<app-button type="submit" [loading]="saving" [aria]="{'aria-label': 'Save changes'}">
  <span>Save <strong>changes</strong></span>
</app-button>

<app-dialog [(visible)]="confirmVisible" header="Confirm changes">
  <p>Apply these changes?</p>
  <div dialogActions>
    <app-button label="Cancel" (click)="confirmVisible = false" />
    <app-button label="Apply" [loading]="saving" (click)="apply()" />
  </div>
</app-dialog>

<app-pagination [(first)]="offset" [(rows)]="pageSize" [totalRecords]="total"
  [rowsPerPageOptions]="[10, 25, 100]" (pageChange)="loadPage($event)" />
```

Import `ButtonComponent`, `DialogComponent`, and `PaginationComponent`. Button projects nested content into its actual button and forwards its `aria` dictionary there. Loading shows the PrimeNG spinner, sets `aria-busy`, and disables activation; use an accessible name for icon-only buttons.

Dialog is modal, closes with Escape or its close button, traps focus and restores the opener's focus. Background clicks do not dismiss it; dragging and resizing are disabled. The application supplies all action buttons through `[dialogActions]` and controls `visible`.

Pagination defaults to `first = 0`, `rows = 10`, and `totalRecords = 0`. `first` is the record offset, and `page` in the exported `PaginatorState` event is zero-based. The component changes page state; the application loads or slices records.

## Development checks

Run `npm run build` and `npm run check:ui`. The latter checks strict Angular consumer templates and the affected component/integration tests, including Toast. `npm run check:toast` remains available. The existing runner reuses Jest from the sibling `../angular-core` checkout; it must be present. Select individual specs with `node scripts/check-toast.cjs "projects/ui/src/lib/button/*.spec.ts"`.

## Toast

Import the standalone host and place it once in your application's root template:

```ts
import { Component, inject } from '@angular/core';
import { ToastComponent, ToastService } from 'springest';

@Component({
  selector: 'app-root',
  imports: [ToastComponent],
  template: '<app-toast /><button (click)="save()">Save</button>',
})
export class AppComponent {
  private readonly toast = inject(ToastService);

  save(): void {
    this.toast.mostrarToast('Saved', 'Your changes were saved', 'correct');
  }
}
```

`mostrarToast(message, description = null, variant = 'correct')` supports `correct`, `warn`, `error`, and `info`. A new notification replaces the current one and restarts its five-second lifetime. The host appears at the top right using your configured PrimeNG theme. Close it with its accessible close button or call `clear()`. `toast$` emits the current `ToastPayload` or `null`.

`ToastService` is provided in root. The host provides its own PrimeNG `MessageService`; no application provider is needed. `ToastPayload` and `ToastVariant` are also exported from `springest`.

## License

MIT. See LICENSE.
