# Changelog

All notable changes to this project are documented here.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.33](https://github.com/JEStaubach/fs-helpers/compare/fs-helpers-v0.2.32...fs-helpers-v0.2.33) (2026-10-11)


### Documentation

* **fs-helpers:** document local checks ([#102](https://github.com/JEStaubach/fs-helpers/issues/102)) ([b91c821](https://github.com/JEStaubach/fs-helpers/commit/b91c82132a3bae7b73c01077142e1de336deb4ed))

## [0.2.32](https://github.com/JEStaubach/fs-helpers/compare/fs-helpers-v0.2.31...fs-helpers-v0.2.32) (2026-10-11)


### Miscellaneous Chores

* add Codacy upload and migrate coverage to V8 ([#99](https://github.com/JEStaubach/fs-helpers/issues/99)) ([ae8d494](https://github.com/JEStaubach/fs-helpers/commit/ae8d494dcb65829bd542c900cf453441285fc9fc))

## 0.2.31

### Changed

- Added conditional package exports for ESM imports, CommonJS `require()`, and TypeScript declarations.
- Updated the `fs-extra` runtime dependency and the development build, test, and lint toolchain.

### Deprecated

- Loading the CommonJS/UMD entry in Node.js now emits a `DeprecationWarning` with code `DEP_FS_HELPERS_CJS`. The entry remains available; see the [migration guide](MIGRATION.md) for the recommended ESM import.
