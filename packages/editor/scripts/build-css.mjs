import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

const entries = [
  ['src/styles/index.scss', 'dist/xeditor-editor.css'],
  ['src/styles/core.scss', 'dist/styles/core.css'],
  ['src/styles/content.scss', 'dist/styles/content.css'],
  ['src/styles/ui.scss', 'dist/styles/ui.css'],
];

for (const [input, output] of entries) {
  const inputPath = path.resolve(packageRoot, input);
  const outputPath = path.resolve(packageRoot, output);
  const result = compile(inputPath, {
    style: 'expanded',
    sourceMap: false,
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, result.css);
}

console.log(`Built ${entries.length} CSS bundles.`);
