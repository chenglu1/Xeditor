import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'XEditor',
      fileName: (format) => (format === 'es' ? 'index.esm.js' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@tiptap/core',
        '@tiptap/react',
        '@tiptap/starter-kit',
        '@tiptap/extension-character-count',
        '@tiptap/extension-details',
        '@tiptap/extension-highlight',
        '@tiptap/extension-link',
        '@tiptap/extension-image',
        '@tiptap/extension-list',
        '@tiptap/extension-placeholder',
        '@tiptap/extension-table',
        '@tiptap/extension-table-cell',
        '@tiptap/extension-table-header',
        '@tiptap/extension-table-row',
        '@tiptap/extension-text-align',
        '@tiptap/extension-ordered-list',
        '@tiptap/extension-mathematics',
        '@tiptap/markdown',
        '@tiptap/pm',
        '@radix-ui/react-popover',
        '@floating-ui/react',
        'katex',
        'lodash-es',
        'react-hotkeys-hook',
        'styled-components',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: false,
    emptyOutDir: false,
  },
});
