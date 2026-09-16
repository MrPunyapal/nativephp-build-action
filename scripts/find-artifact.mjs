import { appendFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const directory = process.env.ARTIFACT_DIRECTORY;
const extension = process.env.BUILD_TYPE === 'bundle' ? '.aab' : '.apk';

async function findArtifacts(current) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findArtifacts(fullPath));
    } else if (entry.name.endsWith(extension) && (await stat(fullPath)).isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

if (!directory) {
  console.error('Artifact directory was not provided.');
  process.exit(1);
}

const artifacts = await findArtifacts(directory).catch(() => []);

if (artifacts.length !== 1) {
  console.error(`Expected exactly one ${extension} artifact in ${directory}, found ${artifacts.length}.`);
  process.exit(1);
}

const artifact = path.resolve(artifacts[0]);
console.log(`Artifact: ${artifact}`);
const output = `artifact=${artifact}\n`;

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, output);
} else {
  process.stdout.write(output);
}
