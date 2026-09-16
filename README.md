# NativePHP Build Action

Community GitHub Action for building NativePHP Mobile Android and iOS applications directly on GitHub-hosted runners.

This is an independent, open-source project. It uses NativePHP's official CLI and does not replace NativePHP or Bifrost.

## Quick start

NativePHP Mobile 4's release packaging requires Android signing credentials. Store the keystore as a base64-encoded GitHub Secret. Development APKs can use `build-type: debug`, which generates a temporary keystore on the runner and does not require signing secrets.

```yaml
name: Build Android

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build NativePHP Android APK
        id: build
        uses: mrpunyapal/nativephp-build-action@v1
        with:
          platform: android
          build-type: release
          keystore: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
          keystore-password: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          key-alias: ${{ secrets.ANDROID_KEY_ALIAS }}
          key-password: ${{ secrets.ANDROID_KEY_PASSWORD }}

      - uses: actions/upload-artifact@v4
        with:
          name: nativephp-android-apk
          path: ${{ steps.build.outputs.artifact }}
```

For a development APK without signing secrets, use `build-type: debug`. For a Play Store bundle, use `build-type: bundle`. The bundle output is an `.aab` instead of an `.apk`.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `platform` | `android` | `android` or `ios`; iOS requires a macOS runner. |
| `build-type` | `release` | Android: `debug`, `release`, or `bundle`; iOS: `release` for a signed IPA. |
| `working-directory` | `.` | Laravel application directory. |
| `php-version` | `8.4` | PHP version. |
| `node-version` | `22` | Node.js version. |
| `java-version` | `17` | Java version used by Gradle. |
| `android-api-level` | `36` | Android platform SDK. |
| `android-build-tools` | `36.0.0` | Android build-tools package. |
| `android-ndk` | `27.0.12077973` | NDK used by the NativePHP Android template. |
| `keystore` | — | Base64-encoded JKS/keystore content. Required for release and bundle builds. |
| `keystore-password` | — | Keystore password. |
| `key-alias` | — | Signing key alias. |
| `key-password` | — | Signing key password. |
| `ios-certificate` | — | Base64-encoded iOS `.p12` certificate. |
| `ios-certificate-password` | — | iOS certificate password. |
| `ios-provisioning-profile` | — | Base64-encoded `.mobileprovision` file. |
| `ios-team-id` | — | Apple Developer Team ID. |
| `ios-export-method` | `app-store` | iOS export method. |

## Outputs

`artifact` is the absolute path to exactly one generated `.apk`, `.aab`, or `.ipa`. The Action fails if the expected artifact is missing or ambiguous.

## iOS

iOS builds must run on macOS with Xcode. A signed IPA requires an Apple certificate, provisioning profile, certificate password, and Team ID:

```yaml
jobs:
  build-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - name: Build NativePHP iOS IPA
        id: build
        uses: mrpunyapal/nativephp-build-action@v1
        with:
          platform: ios
          ios-certificate: ${{ secrets.IOS_CERTIFICATE_BASE64 }}
          ios-certificate-password: ${{ secrets.IOS_CERTIFICATE_PASSWORD }}
          ios-provisioning-profile: ${{ secrets.IOS_PROVISIONING_PROFILE_BASE64 }}
          ios-team-id: ${{ secrets.APPLE_TEAM_ID }}
      - uses: actions/upload-artifact@v4
        with:
          name: nativephp-ios-ipa
          path: ${{ steps.build.outputs.artifact }}
```

## Signing

Create or export the keystore locally, then encode it without line wrapping:

```bash
base64 -w 0 pinkary.keystore > pinkary.keystore.base64
```

Save the encoded contents as `ANDROID_KEYSTORE_BASE64` and save the three passwords/aliases as separate GitHub Secrets. The Action writes the keystore only to the runner's temporary directory, passes the path through NativePHP's supported environment variables, and removes it in an `always()` cleanup step.

Do not print the secret, pass it in a command string, or commit the keystore.

## What the Action does

1. Validates the platform and signing inputs.
2. Restores Composer, npm, and Android Gradle caches when available.
3. Installs PHP, Composer, Node.js, and the platform toolchain.
3. Installs Composer/npm dependencies and builds frontend assets when the project defines a build script.
4. Runs `php artisan native:install android|ios`.
5. Runs the corresponding `php artisan native:package` command.
6. Locates and exposes the generated artifact.

The underlying Composer, NativePHP, and Gradle output remains visible in the workflow log.

## Tested application and requirements

The first integration target is the Pinkary NativePHP application. Its current requirements are PHP `^8.4`, Laravel `13.17+`, Node.js `22`, npm, NativePHP Mobile `4.4`, Java `17`, Android API `36`, CMake `3.22.1`, and NDK `27.0.12077973`.

The Action is designed for `ubuntu-latest`. Android release and bundle packaging require a signing keystore because NativePHP's `native:package` command creates signed distribution artifacts. Debug mode creates a short-lived development keystore inside the runner.

## Limitations

- No Play Store or App Store publishing.
- No hosted build service, dashboard, or billing.
- A GitHub-hosted release/bundle integration run needs a pushed application repository with signing secrets.

## License and project status

MIT licensed. This is a community-maintained Action and is not an official NativePHP project.
