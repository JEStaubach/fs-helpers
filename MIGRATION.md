# Migration Guide

## 0.2.31

This release does not remove APIs or change the shape of the package exports. Existing helper creation and synchronous methods continue to work. The only behavior change for consumers is a deprecation warning when Node.js loads the CommonJS entry.

### Recommended: use ESM

Replace a CommonJS import:

```js
const fsHelpers = require('@jestaubach/fs-helpers');
const helpers = fsHelpers.use(fsExtra);
```

with an ESM import:

```js
import fsHelpers from '@jestaubach/fs-helpers';
const helpers = fsHelpers.use(fsExtra);
```

The ESM entry is selected by `import` and does not emit the CommonJS deprecation warning. The helper API and its synchronous operations are unchanged.

### If you continue using CommonJS

No immediate code change is required. `require('@jestaubach/fs-helpers')` still selects the CommonJS entry and retains the existing API, but Node.js emits a `DeprecationWarning` with code `DEP_FS_HELPERS_CJS` when the package is loaded. CommonJS is deprecated, not removed in this release; no removal version is announced.

The warning is specific to the Node.js CommonJS/UMD bundle. Loading the UMD bundle in a browser does not emit it. TypeScript declarations are still provided through the package's `types` export.

### Update the dependency

To move an application or downstream package to this release:

```sh
npm install @jestaubach/fs-helpers@^0.2.31
```

No downstream source changes are required unless you choose to migrate from CommonJS to ESM.
