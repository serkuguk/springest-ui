const path = require('node:path');
const { createRequire } = require('node:module');

// ponytail: reuse angular-core's installed Jest; add a library test runner when tests need to run independently.
const consumerRoot = path.resolve(__dirname, '../../angular-core');
const consumerRequire = createRequire(path.join(consumerRoot, 'package.json'));
const { createCjsPreset } = consumerRequire('jest-preset-angular/presets');
const { runCLI } = consumerRequire('jest');
const rootDir = path.resolve(__dirname, '..');
const preset = createCjsPreset({ tsconfig: {
  target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler',
  experimentalDecorators: true, emitDecoratorMetadata: true,
  esModuleInterop: true, skipLibCheck: true,
  types: [path.join(consumerRoot, 'node_modules/@types/jest')],
} });
const config = {
  ...preset,
  testEnvironment: consumerRequire.resolve('jest-environment-jsdom'),
  snapshotSerializers: preset.snapshotSerializers.map(name => consumerRequire.resolve(name)),
  transform: Object.fromEntries(Object.entries(preset.transform).map(([pattern, [name, options]]) =>
    [pattern, [consumerRequire.resolve(name), options]])),
  rootDir,
  setupFilesAfterEnv: [path.join(consumerRoot, 'src/setup.jest.ts')],
  testMatch: ['<rootDir>/projects/ui/src/lib/toast/toast.component.spec.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  modulePaths: [path.join(consumerRoot, 'node_modules')],
  moduleNameMapper: Object.fromEntries(
    ['core', 'common', 'compiler', 'platform-browser', 'platform-browser-dynamic', 'forms'].flatMap(name => {
      const packageName = `@angular/${name}`;
      return Object.keys(consumerRequire(`${packageName}/package.json`).exports).filter(entry => !entry.includes('*')).map(entry => {
        const specifier = packageName + (entry === '.' ? '' : entry.slice(1));
        return [`^${specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, consumerRequire.resolve(specifier)];
      });
    }),
  ),
};

runCLI({ config: JSON.stringify(config), runInBand: true }, [rootDir])
  .then(({ results }) => { process.exitCode = results.success ? 0 : 1; })
  .catch(error => { console.error(error); process.exitCode = 1; });
