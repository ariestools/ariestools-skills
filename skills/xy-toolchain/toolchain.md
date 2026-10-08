# Toolchain and Project Setup

## Contents

- [Start from repository truth](#start-from-repository-truth)
- [Package manager](#package-manager)
- [Installation](#installation)
- [Root CLI versus package hooks](#root-cli-versus-package-hooks)
- [Root scripts](#root-scripts)
- [New project baseline](#new-project-baseline)
- [Migration and troubleshooting](#migration-and-troubleshooting)
- [Version notes](#version-notes)

## Start from repository truth

Before running or adding commands:

1. Read the root and target-package `package.json` scripts.
2. Read the root `packageManager` field and lockfile.
3. Read root and package `xy.config.ts` files.
4. Check the installed toolchain with `pnpm list @ariestools/toolchain --depth 0` and compare it with [Version notes](#version-notes).
5. Use the repository script when it already represents the requested gate.
6. Ask the installed version when command behavior is uncertain: `pnpm xy <command> --help`, `pnpm xy <command> --rules` for rule ids and levels, and `pnpm xy --stability` for the stable/experimental catalog (since 9.2.0).

Do not substitute a raw `tsc`, ESLint, esbuild, or Vitest invocation for a repository wrapper unless a targeted diagnostic requires functionality the wrapper does not expose.

## Package manager

Use pnpm for new repositories. It is the fully supported and recommended package manager; Bun, npm, and Yarn support is experimental.

The CLI detects the package manager in this order:

1. The root `packageManager` field.
2. pnpm workspace or lock files.
3. Bun lock files.
4. Yarn lock/config files.
5. npm lock files.

The implementation falls back to Yarn when no signal exists. Do not rely on that fallback: set `packageManager`, commit exactly one lockfile, and use that manager exclusively.

Every pnpm repository, single-package or monorepo, needs a root `pnpm-workspace.yaml`. `xy packman lint` runs in `xy check` and fails without the file, and its `--fix` cannot create it. Minimal content:

```yaml
packages:              # monorepos only
  - 'packages/*'
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
  - '@ariestools/*'
verifyDepsBeforeRun: warn
```

- `minimumReleaseAge` must meet the floor in `commands.packman.minimumReleaseAge` (default 1440 minutes).
- `minimumReleaseAgeExclude` must list exactly the known scopes (`@ariestools/*`, `@xylabs/*`, `@xyo-network/*`) that the repository's package names and dependencies use. A missing scope and an unused known scope are both errors. Quote each pattern; YAML cannot start a plain value with `@`.
- `verifyDepsBeforeRun` must be set.
- Workspace globs go under `packages:`, never in package.json `workspaces` (`repo.workspaces-field-placement`). A `packages:` list makes the repository a monorepo to `xy`, so leave it out of single-package repositories.

Once the file exists, `pnpm xy packman lint --fix` (or `pnpm xy check --fix`) fills in missing settings.

## Installation

The published toolchain requires Node.js 22 or newer, and peers on TypeScript `^5.9 || ^6.0` and ESLint `^10.3`. Install it at the repository root, after `pnpm-workspace.yaml` exists:

```sh
pnpm add -D -w @ariestools/toolchain @ariestools/tsconfig typescript@^6 eslint@^10.3
```

`-w` (`--workspace-root`) is required when `pnpm-workspace.yaml` lists more than one `packages` pattern (pnpm otherwise stops with `ERR_PNPM_ADDING_TO_ROOT`) and harmless otherwise; without a `pnpm-workspace.yaml` it fails. The toolchain, config packages, ESLint, TypeScript, and Vitest belong in the root `devDependencies`, because `xy` runs from the root.

Always give `typescript` a range: an unversioned install now resolves TypeScript 7, which the toolchain cannot load ([typescript.md](typescript.md)).

Add the appropriate ESLint and TypeScript variants from [eslint.md](eslint.md) and [typescript.md](typescript.md). For Vitest presets use `@ariestools/vitest-config` ([testing.md](testing.md)); for environment-neutral ambient globals use `@ariestools/lib-neutral` ([typescript.md](typescript.md)). Pin versions according to the repository's dependency policy; do not copy the toolchain repository's current patch versions blindly.

## Root CLI versus package hooks

Use `xy` at repository/workspace scope. The CLI discovers workspaces, orders compilation, applies concurrency, supports incremental execution, and aggregates diagnostics.

`@ariestools/toolchain` installs two CLIs (since 9.2.0): `xy`, which is semver-stable, and `xyex`, an experimental superset whose commands and flags may change on a minor release. Prefer `xy` in scripts, CI, and examples. Run `pnpm xyex <command>` only for commands that `pnpm xy --stability` marks experimental; under `xy` they still run, with a warning. See [channels](commands.md#stable-and-experimental-channels) and the toolchain's [stability policy](https://github.com/ariestools/toolchain/blob/main/docs/STABILITY.md).

| Command | Actual purpose |
|---|---|
| `xy compile [package]` | Validate TypeScript and emit package output |
| `xy recompile [package]` | Clean, then compile |
| `xy build [package]` | Compile, then run publint, deplint, and ESLint |
| `xy rebuild [package]` | Clean, then run a non-incremental build |
| `xy clean [package]` | Remove build artifacts; optional `--full` / `--full-all` for gitignored hygiene (see [commands.md](commands.md#clean)) |
| `xy test [target]` | Run Vitest for a workspace or path (prefer `@ariestools/vitest-config`; see [testing.md](testing.md)) |
| `xy check` | Run repository/configuration policy checks, including agent lint since 10.1.1; see [commands.md](commands.md) |
| `xy fix [package]` | Run the standard fixable policy and source checks |
| `xy deplint …` | Dependency policy analysis; `xy deplint pick` for interactive placement (see [commands.md](commands.md)) |
| `xy agent …` | AGENTS.md and docs convention: `lint`, `init`, `audit`, `index`, `archive` (since 10.1.1); see [commands.md](commands.md) and the [xy-agent](../xy-agent/SKILL.md) skill |
| `xyex work …` | Experimental repo-local work tracking with optional GitHub Issues dual-write/sync and multi-folder `--workspace` scope; flags and storage may change on a minor (see [commands.md](commands.md#skills-and-work-tracking)) |

`xy build` does not run tests, license checks, security metadata checks, or every check in `xy check`. Run the required gates explicitly.

The `package-*` binaries are per-package hooks that root orchestration invokes and package scripts can extend. They are an implementation detail of `xy`, not a semver-stable surface: prefer `xy` in docs, scripts, and CI, and call a hook directly only where no `xy` equivalent exists (for example `package-sync-layout --check`).

| Hook | Purpose |
|---|---|
| `package-compile` | Validate and emit one package |
| `package-recompile` | Clean and compile one package |
| `package-build` | Compile and publint one package |
| `package-lint` / `package-fix` | Lint or fix one package |
| `package-publint` | Validate one package's publish surface |
| `package-clean` | Clean one package |
| `package-sync-layout` | Generate or `--check` a monolith layout without compiling; `xy compile` already re-syncs it |

The `-only` binaries are not reduced pipelines. `package-compile-only`, `package-build-only`, and `package-recompile-only` invoke the toolchain implementation while bypassing a same-named package script override. Use them when extending a package hook without recursion:

```json
{
  "scripts": {
    "package-compile": "package-compile-only && tsx scripts/generate-types.ts"
  }
}
```

Never call `pnpm run package-compile` from inside the `package-compile` script; that re-enters itself.

## Root scripts

Preserve existing repository script names. When adding minimal wrappers, point each at `xy`, as the `xy repo init` scaffold does:

```json
{
  "scripts": {
    "build": "xy build",
    "compile": "xy compile",
    "lint": "xy lint",
    "fix": "xy fix",
    "test": "xy test",
    "check": "xy check"
  }
}
```

`xy <command>` hands off to a same-named root script and forwards the rest of the command line, so `pnpm xy test <path>` runs `pnpm run test <path>`. A wrapper such as `"test": "xy test"` is safe: the hand-off sets `XY_LOCAL_SCRIPT=1`, and the inner `xy` runs the built-in command. A script such as `"test": "vitest run"` would receive the target as a Vitest filename filter instead. `--no-defer` or `XY_NO_DEFER=1` forces the built-in command; since 10.1.1, `publish` and `deploy` hand off only with `--defer`. See [commands.md](commands.md#global-behavior).

Compile and build are incremental by default for all-workspace runs. Use `--no-incremental` when validating a clean full run. Use `xy rebuild` when artifacts must be removed first.

## New project baseline

`xy repo init [template] [name]` scaffolds a repository. Without a template it runs an interactive wizard: `pnpm xy repo init`, or `npx --package=@ariestools/toolchain xy repo init` in an empty directory. `cli` is the only template. The defaults are scope `@ariestools`, license MIT, author Aries Tools, pnpm, a monorepo, and skills tier `xy`, so a non-interactive run should pass every choice that differs for the target organization:

```sh
pnpm xy repo init cli <name> --scope <scope> --license <spdx> --skills-tier <none|xy|xyo|xl1> --yes
```

Inspect the generated output before committing. Check its pins against current peers: `vitest` must satisfy the `@ariestools/vitest-config` peer (`^5`), `volta.node` should be a current Node release, and a single-package pnpm scaffold may lack `pnpm-workspace.yaml`. Then bring it up to the baseline below.

Whether scaffolded or set up by hand, a new TypeScript repository needs, in every topology:

1. Pin pnpm in `packageManager` and create the root `pnpm-workspace.yaml` with the release-age settings ([Package manager](#package-manager)).
2. Install `@ariestools/toolchain`, the correct config packages, ESLint, and TypeScript at the root ([Installation](#installation)).
3. Prefer `@ariestools/vitest-config` at the root; a single-package repo passes an explicit `include` ([testing.md](testing.md)). For neutral packages that need common timers/abort globals, add `@ariestools/lib-neutral`.
4. Set `"type": "module"`.
5. Put application or library source under `src/`.
6. Create `xy.config.ts`, `tsconfig.json`, and `eslint.config.ts` at the appropriate root.
7. Generate `eslint.config.ts` with `pnpm xy lint init` (interactive; see [eslint.md](eslint.md#use-the-active-flat-config) for the non-TTY path and the follow-up fixes) rather than copying an old ESLint configuration.
8. Run `pnpm xy agent init` (since 10.1.1), then fill in AGENTS.md ([xy-agent](../xy-agent/SKILL.md)). It scaffolds AGENTS.md, a CLAUDE.md adapter, and the docs/ layout without overwriting. Agent lint requires a root AGENTS.md with orient, authority, repository map, commands, and failures sections, and a CLAUDE.md, if present, that is only an `@AGENTS.md` import or a symlink to AGENTS.md. `xy check --fix` cannot create these files.
9. Run `pnpm xy skills lint --fix` to install the skills the repository requires.
10. Add `**/.xy/cache/` to the root `.gitignore`; a bare `.xy/cache` entry covers only the root package.

Single-package repositories: the root is the package, and a published one declares `"engines": { "node": ">=22" }`. Do not apply the monorepo-only rules below, such as root `private: true`.

Monorepos: repo lint, part of `xy check`, also enforces:

- The root is `private: true`; workspace packages live under `packages/`, are covered by the `pnpm-workspace.yaml` globs, and keep specs in `spec/` folders.
- Only the root declares `volta`; pin a current Node release there (an older pin warns). The root and private packages declare no `engines`.
- Every publishable package declares `engines.node`, for example `">=22"`, and the range must include the latest Node release. Repositories that deliberately track Node LTS set `nodeTrack: 'lts'` ([commands.md](commands.md#repository-policy)). Do not strip `engines` from neutral or browser packages to satisfy `xy node lint`.
- Every workspace package has a consumer README.md, listed in `files` when publishable (since 10.0.5; `xy repo lint --fix` scaffolds one).

Raise the Node floor when a dependency needs a newer runtime; for example, `@ariestools/sdk` 9.x requires Node 26.

Finish with `pnpm xy check --fix`, then run `pnpm xy build`, `pnpm xy test`, and `pnpm xy check` before handing off. `--fix` regenerates docs/README.md from document front matter, so in an existing repository with a hand-written docs index read [commands.md](commands.md#repository-policy) first. For CI gate order, see [commands.md](commands.md#ci-gates).

## Migration and troubleshooting

### Migrating from `@xylabs/*`

The retired toolchain packages are `@xylabs/toolchain`, `@xylabs/ts-scripts-common`, `@xylabs/ts-scripts-pnpm`, `@xylabs/ts-scripts-yarn3`, `@xylabs/ts-scripts-react-pnpm`, `@xylabs/ts-scripts-react-yarn3`, and the `@xylabs` ESLint-config and tsconfig packages. The compatibility stubs are no longer built in the active monorepo. No `xy` or `xyex` command rewrites package.json for you; migrate by hand, following the toolchain's [migration guide](https://github.com/ariestools/toolchain/blob/main/docs/migrate-xylabs.md):

1. Replace the legacy packages in `devDependencies` with `@ariestools/toolchain`.
2. Point the ESLint config and tsconfig `extends` at the `@ariestools/*` packages.
3. Move scripts to `xy build`, `xy compile`, `xy lint`, and `xy test`, run from the repository root.
4. Adopt pnpm (`packageManager` plus one lockfile). `pnpm xyex packman convert pnpm` is an experimental helper that converts the repository to pnpm and swaps the managed `@xylabs` toolchain packages for `@ariestools/toolchain`.

Then run `pnpm xy skills lint --fix`. Since 9.2.0, `skills.migrated-source` is an error until xy-development and xy-toolchain are installed from ariestools-skills.

### Upgrading 9.x to 10.x

10.0.0 removed four top-level aliases. On 10.x each old name prints `Command not found` and exits 0, so a script, CI step, or agent command that still uses one passes without checking anything:

| Removed | Use |
|---|---|
| `xy gitlint` | `xy git lint` |
| `xy lintlint` | `xy lint lint` |
| `xy node-lint` | `xy node lint` |
| `xy republint` | `xy publint --fresh` |

9.2.0 removed `xy skills updo`; use `xy skills lint --fix`. Search package.json scripts, `.github/workflows/`, `.claude/commands/`, and legacy skills for the old names, for example with `git grep -nE 'xy (gitlint|lintlint|node-lint|republint)|skills updo'`.

10.x patch releases also add error-level gates ([Version notes](#version-notes)). Rerun `pnpm xy build` and `pnpm xy check` after every toolchain bump, not only after a major.

### Legacy agent files from `xy claude`

Toolchains before 8.2.8 had an `xy claude` command that wrote agent files, and many repositories still carry its output:

- the skills `xylabs-xy-cli`, `xylabs-xy-deplint-fix`, `xylabs-e2e-setup`, and `xylabs-refactor-cohesion`;
- `.claude/rules/xylabs-*.md`;
- `.claude/commands/xy-*.md`.

They describe `@xylabs/ts-scripts-yarn3`, Yarn, tsup, and commands that no longer exist, such as `compile-only`, `lintlint`, `gitlint`, `deploy-minor`/`-major`/`-next`, `gen-docs`, `readme`, `knip`, and `dupdeps`. This skill supersedes them wherever they conflict; do not run their commands. `xy skills lint` and `xy check` never report them. With the owner's agreement, remove the ones present, reviewing the globbed paths first:

```sh
pnpm xy skills remove xylabs-xy-cli xylabs-xy-deplint-fix xylabs-e2e-setup xylabs-refactor-cohesion -y
git rm .claude/rules/xylabs-*.md .claude/commands/xy-*.md
```

### Troubleshooting

If installation returns 404 or 403, first verify the exact package name and version, registry configuration, and lockfile. The `@ariestools` toolchain/config packages are public; request authentication only when the repository is intentionally configured for a private registry or private package.

If a package command unexpectedly recurses, inspect same-named package scripts and use the matching `-only` binary. If a workspace is skipped, verify workspace discovery, the package name, and the root package-manager configuration before changing filters.

## Version notes

This skill is verified against `@ariestools/toolchain` 10.1.1; anything without a version marker exists from 9.0.0. Find the installed version with `pnpm list @ariestools/toolchain --depth 0`; `pnpm xy --version` reports it only from 10.0.6. A top-level command the installed version lacks prints `Command not found` and exits 0, even under `--strict`; a missing subcommand may instead be passed through or rejected, so check the output and the table below rather than the exit code.

| Since | Change |
|---|---|
| 9.0.1 | `xy secure deps` and `xy secure dependabot` (9.0.0 has only `xy secure [package]`); `repo.dependabot-enabled` |
| 9.0.2 | `xy enable ts-native` (run as `xyex enable ts-native` from 9.2.0) |
| 9.0.3 | `xy lint --mode` |
| 9.1.1 | `git.ignore-toolchain-cache` (`.xy/cache` ignored in every package) |
| 9.2.0 | `xyex` and `xy --stability`; experimental commands warn under `xy`. `xy skills lint --fix` also updates outdated skills, `skills.migrated-source` requires ariestools-skills as the source, and the catalog adds the optional xl1-dapp-kit; `xy skills updo` removed. `xy publish --tag`. `compile.mode: 'tsc'` fails the compile. `**/.claude/**` in the vitest preset excludes. `xy repo init` scaffolds `@ariestools/vitest-config` with an explicit `include` (both layouts) and a `test` script that runs `xy test` |
| 9.2.1 | `xyex plan init` and `xyex plan lint` |
| 10.0.0 | Removed the `gitlint`, `lintlint`, `node-lint`, and `republint` aliases ([Upgrading 9.x to 10.x](#upgrading-9x-to-10x)) |
| 10.0.2 | `@ariestools/vitest-config` peers `vitest` `^5.0` (`^4.1` before) |
| 10.0.3 | Deplint `dep.dependencies.not-public` and `dep.peerDependencies.not-public` (errors) |
| 10.0.5 | Repo lint `repo.package-readme` and `repo.package-readme-files` (errors); `commands.skillsLint.additionalSkills`; `xyex plan lint` root-document rules |
| 10.0.6 | `xy --version` reports the toolchain version |
| 10.0.7 | `nodeTrack` under `commands.repoLint` and `commands.nodeLint`; `xyex npm-org lint` |
| 10.0.8 | package.json `xy.skills` (`skills.package-recommended`, error); skills lint requires xl1-dapp-kit when the repo produces or depends on `@xyo-network/dapp-kit` packages |
| 10.0.9 | Publint `pub.importsMatchExports` (error), and `publint --fix` will not add an export condition that the matching `#alias` does not select. Monolith platform declaration trees share the modules-platform declarations, and layout sync warns about identity-splitting shims |
| 10.1.0 | `@ariestools/vitest-config` default include adds `packages/*/spec/**` and `.tsx`/`.mts`/`.cts` specs. Unicorn v77 rules staged across ESLint tiers (off at 2, warn at 3, error at 4). Compile source directories, entries, and `outdir` / `outfile` / `inject` paths must resolve inside the package. `xyex work sync` edits or closes only issues whose body marker and URL match |
| 10.1.1 | `xy agent` family, with agent lint inside `xy check` (errors); `xy skills pick` and per-skill presence in `commands.skillsLint.skills`; `commands.updo.ignoreDeps`; `publish` and `deploy` hand off to a root script only with `--defer` |
