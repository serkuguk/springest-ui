const path = require('node:path');
const { createRequire } = require('node:module');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

// ponytail: reuse angular-core's installed Jest; add a library test runner when tests need to run independently.
const consumerRoot = path.resolve(__dirname, '../../angular-core');
const consumerRequire = createRequire(path.join(consumerRoot, 'package.json'));
const { createCjsPreset } = consumerRequire('jest-preset-angular/presets');
const { runCLI } = consumerRequire('jest');
const rootDir = path.resolve(__dirname, '..');
const testedAreas = new Set(['button', 'calendar', 'dialog', 'pagination', 'toast', 'controls']);
const patterns = process.argv.includes('--ui')
  ? fs.readdirSync(path.join(rootDir, 'projects/ui/src/lib'), { recursive: true })
    .filter(file => file.endsWith('.spec.ts') && testedAreas.has(file.split(path.sep)[0])
      && !file.startsWith(path.join('controls', 'stepper') + path.sep))
    .map(file => 'projects/ui/src/lib/' + file.replaceAll(path.sep, '/'))
  : process.argv.slice(2).filter(arg => arg !== '--typecheck');
if (process.argv.includes('--typecheck')) {
  const configDir = path.join(rootDir, 'out-tsc/check-ui');
  fs.mkdirSync(configDir, { recursive: true });
  const configPath = path.join(configDir, 'tsconfig.json');
  fs.writeFileSync(configPath, JSON.stringify({
    extends: path.join(rootDir, 'tsconfig.json'),
    compilerOptions: { noEmit: true, types: [path.join(consumerRoot, 'node_modules/@types/jest')] },
    files: [path.join(rootDir, 'projects/ui/src/lib/controls/controls.integration.spec.ts')],
    include: [], exclude: [],
  }));
  const compiler = path.join(path.dirname(require.resolve('@angular/compiler-cli/package.json')), 'bundles/src/bin/ngc.js');
  const result = spawnSync(process.execPath, [compiler, '-p', configPath], { cwd: rootDir, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
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
  testMatch: patterns.length
    ? patterns.map(pattern => `<rootDir>/${pattern}`)
    : ['<rootDir>/projects/ui/src/lib/toast/toast.component.spec.ts'],
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
