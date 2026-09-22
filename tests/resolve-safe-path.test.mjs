import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/resolve-safe-path.mjs', import.meta.url));

function run(env) {
  return spawnSync(process.execPath, [script], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
}

test('resolves a plain relative path under the base directory', () => {
  const result = run({ BASE_DIR: '/work/app', TARGET_PATH: 'resources/google-services.json' });

  assert.equal(result.status, 0);
  assert.equal(result.stdout, '/work/app/resources/google-services.json');
});

test('rejects an absolute path', () => {
  const result = run({ BASE_DIR: '/work/app', TARGET_PATH: '/etc/passwd' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /absolute path/);
});

test('rejects a path that traverses outside the base directory', () => {
  const result = run({ BASE_DIR: '/work/app', TARGET_PATH: '../../etc/passwd' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /escapes working-directory/);
});

test('rejects a path that resolves to the base directory itself', () => {
  const result = run({ BASE_DIR: '/work/app', TARGET_PATH: '.' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /escapes working-directory/);
});

test('fails when required environment variables are missing', () => {
  const result = run({ BASE_DIR: '', TARGET_PATH: '' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /are required/);
});
