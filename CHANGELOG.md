# Changelog

All notable changes to this project are documented here.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.2.30

### Changed

- Added conditional package exports for ESM imports, CommonJS `require()`, and TypeScript declarations.
- Updated the `fs-extra` runtime dependency and the development build, test, and lint toolchain.

### Deprecated

- Loading the CommonJS/UMD entry in Node.js now emits a `DeprecationWarning` with code `DEP_FS_HELPERS_CJS`. The entry remains available; see the [migration guide](MIGRATION.md) for the recommended ESM import.
