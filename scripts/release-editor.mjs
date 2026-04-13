import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const packageRoot = path.join(repoRoot, 'packages', 'editor');
const packageJsonPath = path.join(packageRoot, 'package.json');
const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const gitExecutable = 'git';
const editorTagPrefix = 'editor-v';

function printUsage() {
  console.log(`Usage:
  node scripts/release-editor.mjs --bump patch|minor|major [--dry-run] [--allow-dirty]
  node scripts/release-editor.mjs --version x.y.z [--dry-run] [--allow-dirty]

Options:
  --bump <type>        Increment the package version.
  --version <x.y.z>    Set an explicit package version.
  --dry-run            Verify the release flow without publishing or creating git metadata.
  --allow-dirty        Skip the clean-worktree safety check.
  --no-git             Publish without creating a release commit and tag.
  --provenance         Publish with npm provenance metadata.
  --help               Show this message.
`);
}

function parseArgs(argv) {
  const options = {
    allowDirty: false,
    dryRun: false,
    noGit: false,
    provenance: false,
    bump: null,
    version: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--bump':
        options.bump = argv[index + 1] ?? null;
        index += 1;
        break;
      case '--version':
        options.version = argv[index + 1] ?? null;
        index += 1;
        break;
      case '--allow-dirty':
        options.allowDirty = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        options.noGit = true;
        break;
      case '--no-git':
        options.noGit = true;
        break;
      case '--provenance':
        options.provenance = true;
        break;
      case '--help':
        printUsage();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if ((!options.bump && !options.version) || (options.bump && options.version)) {
    throw new Error('Pass exactly one of --bump or --version.');
  }

  if (options.bump && !['patch', 'minor', 'major'].includes(options.bump)) {
    throw new Error(`Unsupported bump type: ${options.bump}`);
  }

  return options;
}

function isValidSemver(version) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/.test(version);
}

function bumpVersion(currentVersion, bumpType) {
  const match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(
      `Current version "${currentVersion}" is not a simple x.y.z version. Use --version instead.`,
    );
  }

  const [, majorText, minorText, patchText] = match;
  const major = Number(majorText);
  const minor = Number(minorText);
  const patch = Number(patchText);

  switch (bumpType) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      throw new Error(`Unsupported bump type: ${bumpType}`);
  }
}

function shouldUseShell(command) {
  return process.platform === 'win32' && /\.(cmd|bat)$/i.test(command);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repoRoot,
      env: options.env ?? process.env,
      stdio: options.captureOutput ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      shell: shouldUseShell(command),
    });

    let stdout = '';
    let stderr = '';

    if (options.captureOutput) {
      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const commandText = [command, ...args].join(' ');
      reject(
        new Error(
          options.captureOutput
            ? `Command failed (${code}): ${commandText}\n${stderr || stdout}`
            : `Command failed (${code}): ${commandText}`,
        ),
      );
    });
  });
}

async function ensureCleanWorktree() {
  const { stdout } = await runCommand(
    gitExecutable,
    ['status', '--porcelain'],
    { captureOutput: true },
  );

  if (stdout.trim().length > 0) {
    throw new Error(
      'Refusing to release from a dirty worktree. Commit or stash changes first, or rerun with --allow-dirty.',
    );
  }
}

async function ensureTagDoesNotExist(tagName) {
  const { stdout } = await runCommand(
    gitExecutable,
    ['tag', '--list', tagName],
    { captureOutput: true },
  );

  if (stdout.trim() === tagName) {
    throw new Error(`Git tag already exists: ${tagName}`);
  }
}

async function writePackageVersion(nextVersion) {
  const originalText = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(originalText);
  packageJson.version = nextVersion;
  await fs.writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    'utf8',
  );

  return originalText;
}

async function restorePackageJson(originalText) {
  await fs.writeFile(packageJsonPath, originalText, 'utf8');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const originalPackageJson = JSON.parse(
    await fs.readFile(packageJsonPath, 'utf8'),
  );
  const nextVersion = options.version ?? bumpVersion(originalPackageJson.version, options.bump);

  if (!isValidSemver(nextVersion)) {
    throw new Error(`Invalid semver version: ${nextVersion}`);
  }

  if (nextVersion === originalPackageJson.version) {
    throw new Error(
      `Target version ${nextVersion} matches the current package version.`,
    );
  }

  if (!options.allowDirty) {
    await ensureCleanWorktree();
  }

  const tagName = `${editorTagPrefix}${nextVersion}`;

  if (!options.noGit) {
    await ensureTagDoesNotExist(tagName);
  }

  const originalPackageJsonText = await writePackageVersion(nextVersion);
  let packageRestored = false;
  let published = false;
  let gitMetadataCreated = false;

  try {
    console.log(
      `Preparing @chenglu1/xeditor-editor ${originalPackageJson.version} -> ${nextVersion}`,
    );
    await runCommand(npmExecutable, ['run', 'verify:release'], { cwd: packageRoot });

    if (options.dryRun) {
      await restorePackageJson(originalPackageJsonText);
      packageRestored = true;
      console.log(`Dry run passed for @chenglu1/xeditor-editor v${nextVersion}.`);
      return;
    }

    if (!options.noGit) {
      await runCommand(gitExecutable, ['add', packageJsonPath]);
      await runCommand(gitExecutable, ['commit', '-m', `release(editor): v${nextVersion}`]);
      await runCommand(gitExecutable, ['tag', tagName]);
      gitMetadataCreated = true;
      console.log(`Created release commit and git tag ${tagName}.`);
    }

    const publishArgs = ['publish', '--access', 'public', '--ignore-scripts'];
    if (options.provenance) {
      publishArgs.push('--provenance');
    }

    await runCommand(npmExecutable, publishArgs, { cwd: packageRoot });
    published = true;
    console.log(`Published @chenglu1/xeditor-editor@${nextVersion} to npm.`);
  } catch (error) {
    if (!published && !packageRestored && !gitMetadataCreated) {
      await restorePackageJson(originalPackageJsonText);
    }

    if (!published && gitMetadataCreated) {
      console.error(
        [
          `Publish failed after creating local release metadata for ${tagName}.`,
          `If you want to undo the local release commit and tag, run:`,
          `  git tag -d ${tagName}`,
          `  git reset --soft HEAD~1`,
        ].join('\n'),
      );
    }

    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
