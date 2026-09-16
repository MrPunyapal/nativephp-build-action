import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/find-artifact.mjs', import.meta.url));

function run(directory, buildType, outputFile) {
  return spawnSync(process.execPath, [script], {
    env: {
      ...process.env,
      ARTIFACT_DIRECTORY: directory,
      BUILD_TYPE: buildType,
      GITHUB_OUTPUT: outputFile,
    },
    encoding: 'utf8',
  });
}

test('finds exactly one APK and writes the action output', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'nativephp-action-'));
  const outputFile = path.join(directory, 'github-output');
  await writeFile(path.join(directory, 'app-release.apk'), 'apk');

  const result = run(directory, 'release', outputFile);
  const output = await readFile(outputFile, 'utf8');

  assert.equal(result.status, 0);
  assert.match(output, /artifact=.*app-release\.apk/);
});

test('rejects ambiguous artifacts', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'nativephp-action-'));
  const outputFile = path.join(directory, 'github-output');
  await mkdir(path.join(directory, 'nested'));
  await writeFile(path.join(directory, 'one.aab'), 'aab');
  await writeFile(path.join(directory, 'nested', 'two.aab'), 'aab');

  const result = run(directory, 'bundle', outputFile);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /found 2/);
});
