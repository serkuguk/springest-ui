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
