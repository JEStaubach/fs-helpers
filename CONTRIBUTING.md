# CONTRIBUTING

## Release Process

Adapted from "Standard" Release Process described [here](https://cloudfour.com/thinks/how-to-publish-an-updated-version-of-an-npm-package/).

### Safety Checks

1. git pull
1. git status
1. npm ci
1. npm test

### Prepare the release

1. npm run build
1. npm test

### Update the version number

1. npm version [patch|minor|major]

### Publish to npm

1. npm publish --access=public

### git push

1. git push -u origin --tags

## Debugging

### Make changes available for use

1. npm run build
1. npm link

### Use as a dependency in another project

1. npm link ../pt-logger
1. (test changes)

### Uninstall linked dependency

1. npm unlink ../pt-logger
