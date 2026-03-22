import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const webConsumerPackageJson = path.resolve(dirname, '../apps/web/package.json');
const require = createRequire(pathToFileURL(webConsumerPackageJson));

console.log('Testing @chenglu1/xeditor-editor package exports');

const resolvedCjsEntry = require.resolve('@chenglu1/xeditor-editor');
const resolvedAdvancedCjsEntry = require.resolve('@chenglu1/xeditor-editor/advanced');
const resolvedReactI18nextCjsEntry = require.resolve(
  '@chenglu1/xeditor-editor/react-i18next',
);
const resolvedStylesEntry = require.resolve('@chenglu1/xeditor-editor/styles.css');
const resolvedCoreStylesEntry = require.resolve('@chenglu1/xeditor-editor/styles/core.css');
const resolvedContentStylesEntry = require.resolve('@chenglu1/xeditor-editor/styles/content.css');
const resolvedUiStylesEntry = require.resolve('@chenglu1/xeditor-editor/styles/ui.css');
const resolvedPackageJson = require.resolve('@chenglu1/xeditor-editor/package.json');
const packageDir = path.dirname(resolvedPackageJson);
const packageJson = JSON.parse(fs.readFileSync(resolvedPackageJson, 'utf8'));
const resolvedEsmEntry = path.resolve(packageDir, packageJson.exports['.'].import);
const resolvedAdvancedEsmEntry = path.resolve(
  packageDir,
  packageJson.exports['./advanced'].import,
);
const resolvedReactI18nextEsmEntry = path.resolve(
  packageDir,
  packageJson.exports['./react-i18next'].import,
);

console.log('Resolved consumer package.json:', webConsumerPackageJson);
console.log('Resolved ESM entry:', resolvedEsmEntry);
console.log('Resolved CJS entry:', resolvedCjsEntry);
console.log('Resolved advanced ESM entry:', resolvedAdvancedEsmEntry);
console.log('Resolved advanced CJS entry:', resolvedAdvancedCjsEntry);
console.log('Resolved react-i18next ESM entry:', resolvedReactI18nextEsmEntry);
console.log('Resolved react-i18next CJS entry:', resolvedReactI18nextCjsEntry);
console.log('Resolved styles entry:', resolvedStylesEntry);
console.log('Resolved core styles entry:', resolvedCoreStylesEntry);
console.log('Resolved content styles entry:', resolvedContentStylesEntry);
console.log('Resolved ui styles entry:', resolvedUiStylesEntry);
console.log('Resolved package.json:', resolvedPackageJson);

const esmModule = await import(pathToFileURL(resolvedEsmEntry).href);
const advancedEsmModule = await import(pathToFileURL(resolvedAdvancedEsmEntry).href);
const reactI18nextEsmModule = await import(
  pathToFileURL(resolvedReactI18nextEsmEntry).href
);
const cjsModule = require('@chenglu1/xeditor-editor');
const advancedCjsModule = require('@chenglu1/xeditor-editor/advanced');
const reactI18nextCjsModule = require('@chenglu1/xeditor-editor/react-i18next');

if (!esmModule.ConfigurableTiptapEditor && !esmModule.default) {
  throw new Error('ESM export check failed: editor entry was not found');
}

if (!cjsModule) {
  throw new Error('CJS export check failed: require() returned an empty module');
}

if (!advancedEsmModule.createEditorExtensions || !advancedCjsModule.createEditorExtensions) {
  throw new Error('Advanced export check failed: createEditorExtensions was not found');
}

if (
  !reactI18nextEsmModule.ConfigurableTiptapEditor ||
  !reactI18nextEsmModule.useI18nextEditorMessages ||
  !reactI18nextCjsModule.ConfigurableTiptapEditor
) {
  throw new Error(
    'react-i18next export check failed: localized editor entry was not found',
  );
}

console.log(
  'Bundle test passed: package ESM/CJS exports, advanced/react-i18next entrypoints, and stylesheet subpaths are resolvable',
);
