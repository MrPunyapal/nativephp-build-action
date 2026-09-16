const platform = process.env.INPUT_PLATFORM?.trim().toLowerCase();
const buildType = process.env.INPUT_BUILD_TYPE?.trim().toLowerCase();

const errors = [];

if (!['android', 'ios'].includes(platform)) {
  errors.push(`Unsupported platform "${platform || '(empty)'}". Use "android" or "ios".`);
}

const validBuildTypes = platform === 'ios' ? ['release'] : ['debug', 'release', 'bundle'];

if (!validBuildTypes.includes(buildType)) {
  errors.push(`Unsupported build-type "${buildType || '(empty)'}". Use "debug" or "release" for APK, or "bundle" for AAB.`);
}

if (platform === 'android' && buildType !== 'debug') {
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

if (platform === 'ios') {
  for (const [name, value] of [
    ['ios-certificate', process.env.INPUT_IOS_CERTIFICATE],
    ['ios-certificate-password', process.env.INPUT_IOS_CERTIFICATE_PASSWORD],
    ['ios-provisioning-profile', process.env.INPUT_IOS_PROVISIONING_PROFILE],
    ['ios-team-id', process.env.INPUT_IOS_TEAM_ID],
  ]) {
    if (!value?.trim()) {
      errors.push(`Missing required iOS signing input: ${name}.`);
    }
  }
}

if (errors.length > 0) {
  console.error(['NativePHP Build configuration is invalid.', ...errors].join('\n'));
  process.exit(1);
}

console.log(`Validated ${platform} ${buildType} build inputs.`);
