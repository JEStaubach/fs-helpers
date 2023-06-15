/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import commonjsExternals from 'vite-plugin-commonjs-externals';

const externals = ['path', 'constants', 'util', 'assert', 'fs', 'stream'];

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'fs-helpers',
      fileName: 'fs-helpers',
    },
    rollupOptions: {
      external: [
        // ...
      ],
      output: {
        globals: {
          // ...
        },
      },
    }
  },
  optimizeDeps: {
    exclude: externals,
  },
  plugins: [dts(), commonjsExternals({
    externals,
  })],
  test: {
    coverage: {
      provider: 'istanbul'
    }
  },
});