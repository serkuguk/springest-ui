# @springest/ui

Independent Angular 21 library with reusable standalone UI components.

## Build

```bash
pnpm install
pnpm build
```

## Install locally

Create the package archive:

```bash
pnpm pack
```

Install the generated `.tgz` in another Angular 21 project together with the peer dependencies:

```bash
npm install ../springest-ui/springest-ui-0.1.0.tgz primeng @ngx-translate/core chart.js
```

Angular, Angular Forms and RxJS are also peer dependencies and normally already exist in the consuming Angular application. Configure the PrimeNG theme there.

```ts
import { ButtonComponent, TableComponent } from '@springest/ui';
```
