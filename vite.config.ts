/// <reference types="vitest" />

import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import escapeRegExp from 'lodash/escapeRegExp';
import dts from 'vite-plugin-dts';
import builtinModules from 'builtin-modules';
import pkg from './package.json';
import commonjsExternals from 'vite-plugin-commonjs-externals';

const externals = [
  'child_process', 
  ...builtinModules,
  ...Object.keys(pkg.dependencies).map(
    name => new RegExp('^' + escapeRegExp(name) + String.raw`(\/.+)?$`)
  )
];

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'fs-helpers',
      fileName: 'fs-helpers',
    },
  },
  optimizeDeps: {
    exclude: externals as string[],
  },
  plugins: [dts(), commonjsExternals({
    externals,
  })],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: [`text`, `json`, `html`, `lcov`]
    }
  },
});
