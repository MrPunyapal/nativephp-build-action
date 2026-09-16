const platform = process.env.INPUT_PLATFORM?.trim().toLowerCase();
const buildType = process.env.INPUT_BUILD_TYPE?.trim().toLowerCase();

const errors = [];

if (platform !== 'android') {
  errors.push(`Unsupported platform "${platform || '(empty)'}". Only "android" is supported.`);
}

if (!['debug', 'release', 'bundle'].includes(buildType)) {
  errors.push(`Unsupported build-type "${buildType || '(empty)'}". Use "debug" or "release" for APK, or "bundle" for AAB.`);
}

if (buildType !== 'debug') {
  for (const [name, value] of [
    ['keystore', process.env.INPUT_KEYSTORE],
    ['keystore-password', process.env.INPUT_KEYSTORE_PASSWORD],
    ['key-alias', process.env.INPUT_KEY_ALIAS],
    ['key-password', process.env.INPUT_KEY_PASSWORD],
  ]) {
    if (!value?.trim()) {
      errors.push(`Missing required Android signing input: ${name}.`);
    }
  }
}

if (errors.length > 0) {
  console.error(['NativePHP Build configuration is invalid.', ...errors].join('\n'));
  process.exit(1);
}

console.log(`Validated Android ${buildType} build inputs.`);
