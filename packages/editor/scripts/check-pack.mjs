import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

const { stdout } = await execAsync(
  'npm pack --dry-run --json --cache .npm-cache',
  {
    cwd: packageRoot,
    maxBuffer: 20 * 1024 * 1024,
  },
);

const [result] = JSON.parse(stdout);

if (!result) {
  throw new Error('npm pack --dry-run did not return a package summary.');
}

const filePaths = new Set(result.files.map((file) => file.path));
const requiredFiles = [
  'LICENSE',
  'README.md',
  'dist/index.esm.js',
  'dist/index.cjs',
  'dist/xeditor-editor.css',
];

for (const filePath of requiredFiles) {
  if (!filePaths.has(filePath)) {
    throw new Error(`Release package is missing required file: ${filePath}`);
  }
}

const forbiddenFiles = [
  'dist/style.css',
  'dist/index.js',
  'dist/react-i18next.js',
  'dist/advanced.js',
];

for (const filePath of forbiddenFiles) {
  if (filePaths.has(filePath)) {
    throw new Error(
      `Release package still includes legacy runtime artifact: ${filePath}`,
    );
  }
}

console.log(
  `npm pack check passed: ${result.entryCount} files, packed ${result.size} bytes, unpacked ${result.unpackedSize} bytes.`,
);
