import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const katexCssPath = require.resolve('katex/dist/katex.min.css', {
  paths: [packageRoot],
});

const entries = [
  ['src/styles/core.scss', 'dist/styles/core.css'],
  ['src/styles/content.scss', 'dist/styles/content.css'],
  ['src/styles/ui.scss', 'dist/styles/ui.css'],
];

const compiledCss = new Map();

for (const [input, output] of entries) {
  const inputPath = path.resolve(packageRoot, input);
  const outputPath = path.resolve(packageRoot, output);
  const result = compile(inputPath, {
    style: 'expanded',
    sourceMap: false,
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, result.css);
  compiledCss.set(output, result.css);
}

const mathCssOutput = path.resolve(packageRoot, 'dist/styles/math.css');
const mathCss = await fs.readFile(katexCssPath, 'utf8');
await fs.mkdir(path.dirname(mathCssOutput), { recursive: true });
await fs.writeFile(mathCssOutput, mathCss);
compiledCss.set('dist/styles/math.css', mathCss);

const fullStylesOutput = path.resolve(packageRoot, 'dist/xeditor-editor.css');
const fullStyles = [
  compiledCss.get('dist/styles/core.css'),
  compiledCss.get('dist/styles/content.css'),
  compiledCss.get('dist/styles/ui.css'),
  compiledCss.get('dist/styles/math.css'),
]
  .filter(Boolean)
  .join('\n\n');
await fs.writeFile(fullStylesOutput, fullStyles);

console.log('Built 5 CSS bundles.');
