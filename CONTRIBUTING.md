# CONTRIBUTING

## Commit Messages

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/), in the form `type(scope): description` or `type: description`.

Examples:

- `feat(copy): preserve timestamps`
- `fix: handle empty paths`
- `docs: clarify ESM migration`
- `feat!: remove the legacy API` with a `BREAKING CHANGE:` footer describing the impact

Common types include `feat`, `fix`, `docs`, `refactor`, `test`, `build`, and `chore`. A `feat` indicates a minor change, a `fix` indicates a patch, and a breaking change must be marked with `!` or a `BREAKING CHANGE:` footer.

To create a commit with an interactive prompt, stage the intended changes and run `npm run commit`. The Commitlint prompt asks for Conventional Commit fields and creates the commit; the `commit-msg` hook validates the resulting message.

## Release Process

After Conventional Commit changes pass CI and are merged to `main`, the Release workflow opens or updates a release PR. Review the proposed version and changelog, and add or update `MIGRATION.md` manually when consumers need migration guidance. Merge the release PR to create the GitHub release and publish the tested tag to npm.

Before enabling releases, create a fine-grained GitHub token limited to this repository with `contents`, `issues`, and `pull requests` set to read and write, then save it as the `RELEASE_PLEASE_TOKEN` Actions secret. This lets release-please create release PRs and allows their CI workflows to run.

For npm publishing, configure a trusted publisher on npmjs.com for owner `JEStaubach`, repository `fs-helpers`, and workflow filename `release-please.yml`. Allow direct publishing for this trusted publisher. The package must be configured before a release can publish.

Breaking changes before `1.0.0` are configured to increment the minor version.

## Debugging

### Make changes available for use

1. npm run build
1. npm link

### Use as a dependency in another project

1. npm link ../pt-logger
1. (test changes)

### Uninstall linked dependency

1. npm unlink ../pt-logger
