import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // 确保 SCSS 能正确编译
        api: 'modern-compiler',
      },
    },
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        advanced: path.resolve(__dirname, 'src/advanced.ts'),
        'react-i18next': path.resolve(__dirname, 'src/react-i18next.tsx'),
      },
      name: 'XEditor',
      fileName: (format, entryName) => {
        const basename =
          entryName === 'advanced'
            ? 'advanced'
            : entryName === 'react-i18next'
              ? 'react-i18next'
              : 'index';
        return format === 'es' ? `${basename}.esm.js` : `${basename}.cjs`;
      },
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
        'i18next',
        'lodash-es',
        'react-hotkeys-hook',
        'react-i18next',
        'styled-components',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        // 确保 CSS 被提取到单独文件
        assetFileNames: 'xeditor-editor.[ext]',
      },
    },
    sourcemap: false,
    emptyOutDir: false,
  },
});
