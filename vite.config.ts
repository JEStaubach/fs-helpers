/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

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
  plugins: [dts()],
  test: {
    coverage: {
      provider: 'istanbul'
    }
  },
});