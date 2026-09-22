import path from 'node:path';

const baseDir = process.env.BASE_DIR;
const targetPath = process.env.TARGET_PATH;

if (!baseDir || !targetPath) {
  console.error('BASE_DIR and TARGET_PATH environment variables are required.');
  process.exit(1);
}

if (path.isAbsolute(targetPath)) {
  console.error(`Path must be relative to working-directory, got an absolute path: ${targetPath}`);
  process.exit(1);
}

const resolvedBase = path.resolve(baseDir);
const resolvedTarget = path.resolve(resolvedBase, targetPath);
const relativeToBase = path.relative(resolvedBase, resolvedTarget);

if (relativeToBase === '' || relativeToBase.startsWith('..') || path.isAbsolute(relativeToBase)) {
  console.error(`Path escapes working-directory: ${targetPath}`);
  process.exit(1);
}

process.stdout.write(resolvedTarget);
