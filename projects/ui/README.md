# springest

Standalone UI components for Angular 21.2, PrimeNG 21 and Signal Forms.

## Install

```sh
npm install springest@0.1.1 primeng@^21.1.0 @ngx-translate/core@^15.0.0 chart.js@^4.5.0
```

Angular common/core/forms (^21.2.0) and RxJS (^7.8.0) are peer dependencies and must be provided by the application. Angular Signal Forms are experimental in Angular 21; this package targets that version. Configure a PrimeNG theme in your application.

```ts
import { ButtonComponent, BasicSelectComponent } from 'springest';
```

BasicSelect supports a scalar or null value. Use object options with `optionLabel` (default: `name`) and `optionValue` to select a property. Bind with Angular Signal Forms `[formField]` or two-way `[(value)]`. `changed` emits the selected value, blur marks the field touched, and `closed` emits when the popup closes.

## License

MIT. See LICENSE.
