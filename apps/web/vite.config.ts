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
      // CSS 子路径必须排在前面（更具体的优先匹配）
      {
        find: '@chenglu1/xeditor-editor/dist/xeditor-editor.css',
        replacement: path.resolve(
          __dirname,
          '../../packages/editor/dist/xeditor-editor.css',
        ),
      },
      // JS 主入口直接指向 src，开发时无需 rebuild
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
