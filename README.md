# springest

Independent Angular 22.2 UI library built on OptimusUI 2. Release: springest 0.4.0. Consumer installation, application configuration and migration instructions: [projects/ui/README.md](projects/ui/README.md).

## Build and check the package

```sh
pnpm install --frozen-lockfile
pnpm build
npm pack ./dist/ui --dry-run
npm pack ./dist/ui
```

Test the generated archive in a separate Angular 22.2 application with OptimusUI 2.0.2, Aura and OpenNG icons before publishing. Install the archive with pnpm, without PrimeNG or peer-dependency overrides. Keep angular-core unchanged; its existing Jest installation supplies the library test runner only.

Run `pnpm check:toast` for the toast integration check. It reuses Jest and the zoneless test setup already installed in the sibling `../angular-core` project; it does not change that project or install dependencies.

Run `pnpm check:ui` for strict Angular consumer-template compilation and all component tests, including Table, Stepper, Avatar, Charts, InputNumber and Toast. This uses the same sibling Jest setup.

The application must provide Angular common/core/forms/platform-browser/router ^22.2.2, CDK ^22.2.3 and RxJS ^7.8.0. Install and configure the theme and icons in the application, as shown in the consumer README; springest does not configure global styles or providers. The implementation plan and verification record are in [MIGRATION_OPTIMUS_UI.md](MIGRATION_OPTIMUS_UI.md).

## Publish a public release

Publish the unscoped package `springest` from your personal npm account. Verify the account and enable 2FA in npm account settings.

```sh
npm login --registry=https://registry.npmjs.org/
npm whoami
npm publish ./dist/ui --access public
npm view springest@0.4.0 version
```

Publish only `dist/ui`, not this private workspace. Never commit credentials or a token to this repository. Update `projects/ui/package.json` to a new version before every later release; a published name/version cannot be overwritten. Licensed MIT.
