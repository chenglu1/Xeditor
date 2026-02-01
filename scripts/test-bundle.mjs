import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const distDir = path.resolve(dirname, '../packages/editor/dist');

console.log('Testing @chenglu1/xeditor-editor bundle from', distDir);

const esmEntry = path.join(distDir, 'index.esm.js');
const esmUrl = pathToFileURL(esmEntry).href;

await import(esmUrl);

console.log('Bundle test passed: ESM entry is loadable');
