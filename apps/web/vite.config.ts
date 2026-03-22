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
        find: '@chenglu1/xeditor-editor/dist/xeditor-editor.css',
        replacement: path.resolve(
          __dirname,
          '../../packages/editor/dist/xeditor-editor.css',
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
