import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const webConsumerPackageJson = path.resolve(dirname, '../apps/web/package.json');
const require = createRequire(pathToFileURL(webConsumerPackageJson));

console.log('Testing @chenglu1/xeditor-editor package exports');

const resolvedPackageJson = require.resolve('@chenglu1/xeditor-editor/package.json');
const packageDir = path.dirname(resolvedPackageJson);
const packageJson = JSON.parse(fs.readFileSync(resolvedPackageJson, 'utf8'));
const resolvedCjsEntry = path.resolve(packageDir, packageJson.exports['.'].require);
const resolvedEsmEntry = path.resolve(packageDir, packageJson.exports['.'].import);
const resolvedAdvancedCjsEntry = path.resolve(
  packageDir,
  packageJson.exports['./advanced'].require,
);
const resolvedAdvancedEsmEntry = path.resolve(
  packageDir,
  packageJson.exports['./advanced'].import,
);
const resolvedViewerEsmEntry = path.resolve(
  packageDir,
  packageJson.exports['./viewer'].import,
);
const resolvedViewerCjsEntry = path.resolve(
  packageDir,
  packageJson.exports['./viewer'].require,
);
const resolvedReactI18nextCjsEntry = path.resolve(
  packageDir,
  packageJson.exports['./react-i18next'].require,
);
const resolvedReactI18nextEsmEntry = path.resolve(
  packageDir,
  packageJson.exports['./react-i18next'].import,
);
const resolvedStylesEntry = path.resolve(packageDir, packageJson.exports['./styles.css']);
const resolvedCoreStylesEntry = path.resolve(
  packageDir,
  packageJson.exports['./styles/core.css'],
);
const resolvedContentStylesEntry = path.resolve(
  packageDir,
  packageJson.exports['./styles/content.css'],
);
const resolvedMathStylesEntry = path.resolve(
  packageDir,
  packageJson.exports['./styles/math.css'],
);
const resolvedUiStylesEntry = path.resolve(
  packageDir,
  packageJson.exports['./styles/ui.css'],
);

console.log('Resolved consumer package.json:', webConsumerPackageJson);
console.log('Resolved ESM entry:', resolvedEsmEntry);
console.log('Resolved CJS entry:', resolvedCjsEntry);
console.log('Resolved advanced ESM entry:', resolvedAdvancedEsmEntry);
console.log('Resolved advanced CJS entry:', resolvedAdvancedCjsEntry);
console.log('Resolved viewer ESM entry:', resolvedViewerEsmEntry);
console.log('Resolved viewer CJS entry:', resolvedViewerCjsEntry);
console.log('Resolved react-i18next ESM entry:', resolvedReactI18nextEsmEntry);
console.log('Resolved react-i18next CJS entry:', resolvedReactI18nextCjsEntry);
console.log('Resolved styles entry:', resolvedStylesEntry);
console.log('Resolved core styles entry:', resolvedCoreStylesEntry);
console.log('Resolved content styles entry:', resolvedContentStylesEntry);
console.log('Resolved math styles entry:', resolvedMathStylesEntry);
console.log('Resolved ui styles entry:', resolvedUiStylesEntry);
console.log('Resolved package.json:', resolvedPackageJson);

const esmModule = await import(pathToFileURL(resolvedEsmEntry).href);
const advancedEsmModule = await import(pathToFileURL(resolvedAdvancedEsmEntry).href);
const viewerEsmModule = await import(pathToFileURL(resolvedViewerEsmEntry).href);
const reactI18nextEsmModule = await import(
  pathToFileURL(resolvedReactI18nextEsmEntry).href
);
const cjsModule = require(resolvedCjsEntry);
const advancedCjsModule = require(resolvedAdvancedCjsEntry);
const viewerCjsModule = require(resolvedViewerCjsEntry);
const reactI18nextCjsModule = require(resolvedReactI18nextCjsEntry);

if (!esmModule.ConfigurableTiptapEditor && !esmModule.default) {
  throw new Error('ESM export check failed: editor entry was not found');
}

if (!cjsModule) {
  throw new Error('CJS export check failed: require() returned an empty module');
}

if (!advancedEsmModule.createEditorExtensions || !advancedCjsModule.createEditorExtensions) {
  throw new Error('Advanced export check failed: createEditorExtensions was not found');
}

if (!viewerEsmModule.StaticContentViewer || !viewerCjsModule.StaticContentViewer) {
  throw new Error('Viewer export check failed: StaticContentViewer was not found');
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
  'Bundle test passed: package ESM/CJS exports, advanced/viewer/react-i18next entrypoints, and stylesheet subpaths are resolvable',
);
