import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/validate.mjs', import.meta.url));

function run(env) {
  return spawnSync(process.execPath, [script], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
}

test('accepts a signed Android APK build', () => {
  const result = run({
    INPUT_PLATFORM: 'android',
    INPUT_BUILD_TYPE: 'release',
    INPUT_KEYSTORE: 'base64-keystore',
    INPUT_KEYSTORE_PASSWORD: 'secret',
    INPUT_KEY_ALIAS: 'pinkary',
    INPUT_KEY_PASSWORD: 'secret',
  });

  assert.equal(result.status, 0);
});

test('accepts a signed Android bundle build', () => {
  const result = run({
    INPUT_PLATFORM: 'android',
    INPUT_BUILD_TYPE: 'bundle',
    INPUT_KEYSTORE: 'base64-keystore',
    INPUT_KEYSTORE_PASSWORD: 'secret',
    INPUT_KEY_ALIAS: 'pinkary',
    INPUT_KEY_PASSWORD: 'secret',
  });

  assert.equal(result.status, 0);
});

test('accepts a development Android build without signing inputs', () => {
  const result = run({
    INPUT_PLATFORM: 'android',
    INPUT_BUILD_TYPE: 'debug',
  });

  assert.equal(result.status, 0);
});

test('rejects unsupported platforms and missing signing inputs', () => {
  const result = run({ INPUT_PLATFORM: 'ios', INPUT_BUILD_TYPE: 'debug' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Use "android" or "ios"/);
});

test('accepts a signed iOS build', () => {
  const result = run({
    INPUT_PLATFORM: 'ios',
    INPUT_BUILD_TYPE: 'release',
    INPUT_IOS_CERTIFICATE: 'base64-certificate',
    INPUT_IOS_CERTIFICATE_PASSWORD: 'secret',
    INPUT_IOS_PROVISIONING_PROFILE: 'base64-profile',
    INPUT_IOS_TEAM_ID: 'TEAM123',
  });

  assert.equal(result.status, 0);
});

test('rejects an iOS debug build', () => {
  const result = run({ INPUT_PLATFORM: 'ios', INPUT_BUILD_TYPE: 'debug' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Use "debug" or "release"/);
});
