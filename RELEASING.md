# Releasing `@chenglu1/xeditor-editor`

## Local Release

Patch release:

```bash
pnpm run release:editor:patch
```

Minor release:

```bash
pnpm run release:editor:minor
```

Major release:

```bash
pnpm run release:editor:major
```

Explicit version:

```bash
pnpm run release:editor -- --version 1.2.3
```

Dry run:

```bash
pnpm run release:editor:dry-run
```

What the script does:

1. Ensures the git worktree is clean by default
2. Updates `packages/editor/package.json`
3. Runs `npm run verify:release` inside `packages/editor`
4. Creates a local release commit and `editor-vx.y.z` git tag
5. Publishes the package to npm

Local release assumes you already have npm publish access configured, either through `npm login` or `NODE_AUTH_TOKEN`.
