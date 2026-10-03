# springest

Independent Angular 21.2 UI library. Consumer documentation: [projects/ui/README.md](projects/ui/README.md).

## Build and check the package

```sh
pnpm install --frozen-lockfile
pnpm build
npm pack ./dist/ui --dry-run
npm pack ./dist/ui
```

Test the generated archive in angular-core before publishing. Its Forms/Selectors integration tests exercise the packed select through PrimeNG and Signal Forms.

## Publish a public release

Publish the unscoped package `springest` from your personal npm account. Verify the account and enable 2FA in npm account settings.

```sh
npm login --registry=https://registry.npmjs.org/
npm whoami
npm publish ./dist/ui --access public
npm view springest@0.1.1 version
```

Publish only `dist/ui`, not this private workspace. Never commit credentials or a token to this repository. Update `projects/ui/package.json` to a new version before every later release; a published name/version cannot be overwritten. The current release is 0.1.1, licensed MIT.
