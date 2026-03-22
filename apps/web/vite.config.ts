import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: [
      {
        find: '@chenglu1/xeditor-editor/styles.css',
        replacement: path.resolve(
          __dirname,
          '../../packages/editor/src/styles/index.scss',
        ),
      },
      {
        find: '@chenglu1/xeditor-editor/styles/core.css',
        replacement: path.resolve(
          __dirname,
          '../../packages/editor/src/styles/core.scss',
        ),
      },
      {
        find: '@chenglu1/xeditor-editor/styles/content.css',
        replacement: path.resolve(
          __dirname,
          '../../packages/editor/src/styles/content.scss',
        ),
      },
      {
        find: '@chenglu1/xeditor-editor/styles/ui.css',
        replacement: path.resolve(
          __dirname,
          '../../packages/editor/src/styles/ui.scss',
        ),
      },
      {
        find: '@chenglu1/xeditor-editor/react-i18next',
        replacement: path.resolve(
          __dirname,
          '../../packages/editor/src/react-i18next.tsx',
        ),
      },
      {
        find: '@chenglu1/xeditor-editor',
        replacement: path.resolve(
          __dirname,
          '../../packages/editor/src/index.ts',
        ),
      },
    ],
  },
});
