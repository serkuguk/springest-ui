# springest

Standalone UI components for Angular 22.2, PrimeNG 22 and Signal Forms.

## Install

```sh
npm install springest@0.3.0 primeng@^22.1.2 @ngx-translate/core@^18.0.0 chart.js@^4.5.0
```

Angular common/core/forms (^22.2.2) and RxJS (^7.8.0) are peer dependencies and must be provided by the application. This release supports Angular 22 only and uses stable Angular Signal Forms. Configure a PrimeNG theme in your application.

PrimeNG 22 also requires Angular CDK, Router and platform-browser 22. Install these in the application if they are not already present. For library development use TypeScript 6.0.x and Node.js `^22.22.3`, `^24.15.0` or `>=26.0.0`.

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

Input `type` accepts `text` (default), `email`, `search`, or `number`. Text types emit strings; number emits `number | null`, with an empty field represented by `null`. Initialize numeric form/two-way values with `null` or a number. For two-way `[(value)]`, `min`, `max`, and `step` are native input attributes. With `[formField]`, configure `min`, `max`, and `maxLength` in the schema: Angular supplies them to the control and rejects simultaneous property bindings. `step` can still be supplied directly. Input also forwards `autocomplete`, `autocapitalize`, `lang`, `spellcheck`, `readonly`, and both `disabled` and the existing `isDisabled`. The existing `placeholder` remains the fallback floating label when `label` is omitted.

Import `PasswordInputComponent` for password fields. Its `autocomplete` reaches the native password input; choose `current-password` for sign-in or `new-password` for creating/changing a password. Disable automatic capitalization for identifiers with Input's `autocapitalize="off"`:

```html
<app-password-input autocomplete="current-password" [(value)]="password" />
<app-password-input autocomplete="new-password" [(value)]="newPassword" />
<app-basic-input label="Username" autocomplete="username" autocapitalize="off" [(value)]="username" />
```

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

<app-dialog [(visible)]="confirmVisible" header="Confirm changes"
  [closable]="!saving" [closeOnEscape]="!saving" [dismissableMask]="false" closeAriaLabel="Закрыть">
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

Dialog is modal and traps focus, restoring the opener's focus after closing. `closable` and `closeOnEscape` default to true; `dismissableMask` defaults to false. Set `dismissableMask` to true to allow background dismissal. Set `closable` to false during saving to hide the close button and block Escape/background dismissal, including while the dialog is already open. `closeAriaLabel` supplies the close button's accessible name; leaving it unset preserves PrimeNG's existing default. Dragging and resizing are disabled. The application supplies all action buttons through `[dialogActions]` and controls `visible`; disable or guard its own Cancel action during saving too.

Pagination defaults to `first = 0`, `rows = 10`, and `totalRecords = 0`. `first` is the record offset, and `page` in the exported `PaginatorState` event is zero-based. The component changes page state; the application loads or slices records.

## Development checks

Run `npm run build` and `npm run check:ui`. The latter checks strict Angular consumer templates and all component/integration tests, including Table, Stepper, Avatar, Charts, InputNumber and Toast. `npm run check:toast` remains available. The existing runner reuses Jest from the sibling `../angular-core` checkout; it must be present. Select individual specs with `node scripts/check-toast.cjs "projects/ui/src/lib/button/*.spec.ts"`.

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

## Available components

All imports below come from `springest`. Existing selectors remain unchanged.

| Area | Exports |
| --- | --- |
| Text and numbers | BasicInputComponent, InputNumberComponent, PasswordInputComponent, TextareaComponent |
| Choices | BasicSelectComponent (dropdown), MultiSelectComponent, CheckboxComponent, ToggleComponent, SegmentedControlComponent |
| Forms | FormFieldComponent, FilePickerComponent, CalendarComponent, StepperControlComponent, StepperStepDirective |
| Data and display | TableComponent, PaginationComponent, ChartsComponent, AvatarComponent |
| Actions and feedback | ButtonComponent, DialogComponent, ToastComponent, ToastService |
| Official PrimeNG API | ProgressSpinner, Tooltip, Popover, ConfirmPopup, ConfirmationService, Accordion, AccordionPanel, AccordionHeader, AccordionContent |

### InputNumber

Import `InputNumberComponent` and add it to the consuming component's imports. Initialize `amount` as `signal<number | null>(null)`.

```html
<app-input-number label="Amount" [(value)]="amount" [min]="-100" [max]="100"
  [step]="0.5" locale="en-US" [minFractionDigits]="0" [maxFractionDigits]="2" />
<app-input-number label="Price" [(value)]="amount" mode="currency" currency="EUR" locale="de-DE" />
```

The value is a number or null; clearing produces null. Formatting is delegated to PrimeNG.
Currency mode requires a currency code. Defaults: decimal mode, step 1 and PrimeNG's locale/fraction settings.
Use `[formField]="fields.amount"` with a numeric Signal Forms field as in the Fields and validation example.
Put min/max validators in the schema when using formField; do not also bind those inputs.
The component supports FormField labels/errors, changed/touch events, touched, disabled, readonly,
ariaLabel, ariaLabelledBy, ariaDescribedBy, ariaInvalid and focus().
BasicInput with type="number" remains available for native numeric input.

### Spinner, Tooltip, Popover and Accordion

These are direct PrimeNG exports: use their official selectors and inputs.

```ts
import {
  ProgressSpinner, Tooltip, Popover,
  Accordion, AccordionPanel, AccordionHeader, AccordionContent,
} from 'springest';
// Add these exports to the consuming component's imports.
// Component property used by the example:
activePanel: string | number | (string | number)[] | null | undefined = null;
```

```html
<p-progress-spinner ariaLabel="Loading data" />
<button type="button" pTooltip="More information" tooltipEvent="both">Help</button>

<button type="button" (click)="details.toggle($event)">Details</button>
<p-popover #details>
  <p>Additional information</p>
  <button type="button" (click)="details.hide()">Close</button>
</p-popover>

<p-accordion [(value)]="activePanel">
  <p-accordion-panel value="details">
    <p-accordion-header>Details</p-accordion-header>
    <p-accordion-content>Panel content</p-accordion-content>
  </p-accordion-panel>
</p-accordion>
```

Popover exposes show(event), toggle(event) and hide(). Accordion supports multiple expanded
panels with `[multiple]="true"` and an array value. Give each panel a stable, distinct value.
Tooltip supports hover, focus or both; use both for mouse and keyboard access.
Public types include AccordionValue, TooltipPosition, TooltipEvent and the
Tooltip/Popover/ConfirmPopup/ProgressSpinner PassThrough types.

### ConfirmPopup

Provide ConfirmationService in the component that hosts p-confirmpopup and triggers it,
or once at the application root. It is not automatically provided by springest.

```ts
import {Component, inject} from '@angular/core';
import {ConfirmPopup, ConfirmationService} from 'springest';

@Component({
  imports: [ConfirmPopup],
  providers: [ConfirmationService],
  template: `
    <button type="button" (click)="confirm($event)">Apply changes</button>
    <p-confirmpopup />
  `,
})
export class ConfirmExample {
  private readonly confirmation = inject(ConfirmationService);
  confirm(event: MouseEvent): void {
    this.confirmation.confirm({
      target: event.currentTarget as HTMLElement,
      message: 'Apply these changes?',
      acceptLabel: 'Apply',
      rejectLabel: 'Cancel',
      accept: () => this.apply(),
    });
  }
  apply(): void { /* application action */ }
}
```

The Confirmation type is also exported. Dialog is the existing modal app-dialog;
Popover is for arbitrary anchored content; ConfirmPopup is for anchored confirmation.
Toast continues to use ToastComponent and ToastService as documented above.

### Table behavior

Import TableComponent and configure `provideTranslateService()` from `@ngx-translate/core`
at the application root; table headers and tooltip messages use its translation pipe.

Columns are visible unless visible is false. Editing uses editableFieldName, or the first
column marked modificable. Only that cell is edited; empty values cannot be saved.
Activate the edit button/cell to focus the editor. Enter saves and Escape cancels.
rowUpdate contains the original row object, field and new string value; the application applies
the update. Sorting and editing never change input rows. Editing preserves the current page
and is cancelled if its row object is removed or replaced.
Empty values and invalid dates sort last in either direction. Date-reverse displays yyyy-MM-dd.

### Full verification

`npm run check:ui` runs every spec, including Table, Stepper, Avatar, Charts and InputNumber,
plus strict Angular consumer-template compilation. It still reuses Jest from the sibling
angular-core checkout; that checkout must be installed. No new test dependency is required.

## License

MIT. See LICENSE.
