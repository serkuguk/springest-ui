const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { createCjsPreset } = require('jest-preset-angular/presets');
const { runCLI } = require('jest');

const rootDir = path.resolve(__dirname, '..');
const patterns = process.argv.includes('--ui')
  ? ['projects/ui/src/lib/**/*.spec.ts']
  : process.argv.slice(2).filter(arg => arg !== '--typecheck');
if (process.argv.includes('--typecheck')) {
  const configDir = path.join(rootDir, 'out-tsc/check-ui');
  fs.mkdirSync(configDir, { recursive: true });
  const configPath = path.join(configDir, 'tsconfig.json');
  fs.writeFileSync(configPath, JSON.stringify({
    extends: path.join(rootDir, 'tsconfig.json'),
    compilerOptions: { noEmit: true, types: ['jest'] },
    files: [
      'projects/ui/src/lib/controls/controls.integration.spec.ts',
      'projects/ui/src/lib/controls/input-number/input-number.component.spec.ts',
    ].map(file => path.join(rootDir, file)),
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
  types: ['jest'],
} });
const config = {
  ...preset,
  rootDir,
  setupFilesAfterEnv: ['<rootDir>/scripts/setup.jest.ts'],
  testMatch: patterns.length
    ? patterns.map(pattern => `**/${pattern}`)
    : ['**/projects/ui/src/lib/toast/toast.component.spec.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/out-tsc/'],
};

runCLI({ config: JSON.stringify(config), runInBand: true }, [rootDir])
  .then(({ results }) => { process.exitCode = results.success ? 0 : 1; })
  .catch(error => { console.error(error); process.exitCode = 1; });
