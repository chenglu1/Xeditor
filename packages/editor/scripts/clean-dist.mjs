import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const distPath = path.resolve(packageRoot, 'dist');

await fs.rm(distPath, { recursive: true, force: true });

console.log('Cleaned dist directory.');
