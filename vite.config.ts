/// <reference types="vitest" />

import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import escapeRegExp from 'lodash/escapeRegExp';
import dts from 'unplugin-dts/vite';
import builtinModules from 'builtin-modules';
import pkg from './package.json' with { type: 'json' };

const externals = [
  'child_process', 
  ...builtinModules,
  ...builtinModules.map(module => `node:${module}`),
  ...Object.keys(pkg.dependencies).map(
    name => new RegExp('^' + escapeRegExp(name) + String.raw`(\/.+)?$`)
  )
];

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'fs-helpers',
      fileName: 'fs-helpers',
    },
    rolldownOptions: {
      external: externals,
      output: {
        banner: `if (typeof module !== 'undefined' && module.exports && typeof process !== 'undefined' && typeof process.emitWarning === 'function') { process.emitWarning('@jestaubach/fs-helpers: The CommonJS/UMD entry is deprecated; migrate to the ESM entry.', { code: 'DEP_FS_HELPERS_CJS', type: 'DeprecationWarning' }); }`,
      },
    },
  },
  optimizeDeps: {
    exclude: Object.keys(pkg.dependencies),
  },
  plugins: [
    dts({
      entryRoot: resolve(import.meta.dirname, 'src'),
      include: ['src/**/*.ts'],
      insertTypesEntry: true,
    }),
  ],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: [`text`, `json`, `html`, `lcov`]
    }
  },
});
