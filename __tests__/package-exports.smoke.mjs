import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import process from 'node:process';
import { test } from 'node:test';

const require = createRequire(import.meta.url);

test('CommonJS entry emits a deprecation warning and retains the API', () => {
  const warnings = [];
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = (...args) => warnings.push(args);

  try {
    const helpers = require('@jestaubach/fs-helpers');

    assert.equal(typeof helpers.use, 'function');
    assert.ok(helpers.default);
    assert.ok(helpers.mock);
    assert.ok(warnings.some(([message, options]) =>
      String(message).includes('CommonJS/UMD entry is deprecated') &&
      options?.code === 'DEP_FS_HELPERS_CJS' &&
      options?.type === 'DeprecationWarning'));
  } finally {
    process.emitWarning = originalEmitWarning;
  }
});

test('ESM entry retains the API without a CommonJS deprecation warning', async () => {
  const warnings = [];
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = (...args) => warnings.push(args);

  try {
    const helpers = await import('@jestaubach/fs-helpers');

    assert.equal(typeof helpers.default?.use, 'function');
    assert.ok(helpers.default?.mock);
    assert.equal(warnings.some(([, options]) => options?.code === 'DEP_FS_HELPERS_CJS'), false);
  } finally {
    process.emitWarning = originalEmitWarning;
  }
});