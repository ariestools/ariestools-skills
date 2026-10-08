# Command and Policy Catalog

## Contents

- [Global behavior](#global-behavior)
- [Lifecycle gates](#lifecycle-gates)
- [Dependency and publish analysis](#dependency-and-publish-analysis)
- [Repository policy](#repository-policy)
- [Documentation conventions](#documentation-conventions)
- [Skills and work tracking](#skills-and-work-tracking)
- [Clean](#clean)
- [Releasing (owner-directed)](#releasing-owner-directed)
- [Dependency maintenance and utilities](#dependency-maintenance-and-utilities)
- [Configuration and automation](#configuration-and-automation)

## Global behavior

Use `pnpm xy --help` and `pnpm xy <command> --help` from the repository's installed toolchain. Commands evolve faster than copied command lists.

### Stable and experimental channels

Since 9.2.0 the toolchain package ships two binaries:

| Binary | Contract |
|---|---|
| `xy` | Semver-stable. Breaking changes to commands, flags, or stable `xy.config.ts` fields need a major release. |
| `xyex` | Experimental superset of `xy`. Experimental commands, their flags, and their config may change or disappear on a minor release. |

- `pnpm xy --stability` (add `--json`) lists the tier of every command, package, and experimental config surface. Treat it and the toolchain's [STABILITY.md](https://github.com/ariestools/toolchain/blob/main/docs/STABILITY.md) as the source of truth.
- Run `pnpm xyex <cmd>` only for commands the catalog marks experimental. Prefer `xy` in scripts, CI, and examples.
- Experimental commands still run under `xy` with a warning; that path may become a hard error in a future major.
- 9.0.x and 9.1.x have no `xyex` binary; run the same commands as `pnpm xy <cmd>` there.
- Experimental config surfaces (for example `compile.compiler: 'native'`, ESLint tier 4, non-pnpm package managers, and the settings of experimental commands) follow the same minor-release contract.

### Experimental commands

| Command | Purpose | Hazard |
|---|---|---|
| `xyex dead` | Declaration liveness; see [`xyex dead`](#xyex-dead-package-experimental) | `--fix-remove` deletes code |
| `xyex work` | Repo-local work items; see [`xyex work`](#xyex-work-experimental) | Storage and GitHub sync still evolving |
| `xyex plan init` / `plan lint` | Plan manifest and a papers/docs/notes layout | Conflicts with `xy agent lint`; see [Documentation conventions](#documentation-conventions) |
| `xyex npm-org lint [org]` | Stale packages in an npm organization; see [`xyex npm-org lint`](#xyex-npm-org-lint-org-experimental) | Network-bound |
| `xyex orphan list` / `orphan clean` | Directories left holding only build output after package moves | Overlaps `xy clean --full`; `clean` deletes |
| `xyex enable ts-native [--no-install]` | Add the TypeScript 7 native compiler beside `typescript` | Experimental compiler config |
| `xyex tsc-validate [package]` | One-process type check with a shared source cache | Incompatible with the native compiler |
| `xyex packman convert <pm>` / `packman clean` | Package-manager migration aids | `packman clean` deletes `node_modules` and lockfiles; it is not a build-artifact cleaner (use `xy clean`) |
| `xyex sonar` | Quarantined Sonar check | Needs a local `sonar.eslintrc`; may be removed |

React projects also get the stable `xy start` and the experimental `analyze`, `eject`, and `sitemap`; `start` and `eject` wrap CRA `react-scripts` and do not apply to Vite or Next. `xy relint` is deprecated in favor of `xy lint --fresh`. Read experimental flags from `pnpm xyex <cmd> --help` rather than copying them.

### Global flags

| Flag | Behavior |
|---|---|
| `--jobs <n>` | Limit parallel work; defaults to the machine's available CPU parallelism |
| `--json` | Emit a machine-readable result envelope and suppress decorative output |
| `--rules` | List supported rules and effective levels for a rule-bearing command |
| `--stability` | List command, package, and experimental config stability (since 9.2.0) |
| `--strict` | Treat warnings as failures (also `XY_STRICT=1`) |
| `--profile` | Emit package/phase timing information where supported |
| `-v, --verbose` | Verbose logging |
| `--no-defer` | Run the built-in command even when the root `package.json` has a same-named script (also `XY_NO_DEFER=1`); overrides `--defer` |
| `--defer` | Let `publish` and `deploy` run a same-named root script (off by default since 10.1.1) |
| `--no-incremental` | Force a full run where the command is incremental by default (compile, build, lint, publint) |

A top-level command with no subcommand, including one given a positional such as `xy test <target>`, defers to a same-named root `package.json` script and forwards its arguments. Subcommands such as `xy lint lint` never defer.

Do not infer that a zero exit code means zero warnings unless `--strict` was active. For automation, prefer `--json` over parsing decorated terminal output.

## Lifecycle gates

| Command | Included work | Important exclusions |
|---|---|---|
| `xy compile` | Type validation and package emission | Lint, tests, publish checks |
| `xy build` | Compile, publint, deplint, ESLint | Tests, `xy check`, license, secure |
| `xy rebuild` | Clean plus a full non-incremental build | Tests, license, secure |
| `xy test [target]` | Vitest for a workspace or path | Compile and lint |
| `xy check` | Agent docs (AGENTS.md and docs convention, since 10.1.1), Git, package-manager, publish, repo-layout, ESLint-config, and skill policy | Compile, source ESLint, deplint, node lint, tests |
| `xy fix [package]` | Git lint, deplint, repo lint, publint, ESLint, and ESLint-config (`lint lint`) fixes | Packman, skills, and agent fixes (use `xy check --fix`), node lint, tests, compile |

Run the gates required by the target repository or CI rather than treating one aggregate command as universal.

### CI gates

The Aries Tools library repos run this sequence with `NODE_OPTIONS=--max-old-space-size=8192`:

```sh
pnpm install --frozen-lockfile
pnpm xy build --jobs 1
pnpm exec playwright install chromium   # browser-realm repos only
pnpm xy test
```

- Take the Node version from the repository (for example `node-version-file: package.json`) rather than hard-coding it.
- `--jobs` defaults to the runner's core count, and every lint worker inherits `NODE_OPTIONS`, so a large heap multiplied by many workers can exhaust runner memory; that is why these repos pass `--jobs 1`. `xy test` ignores `--jobs`.
- A fresh checkout has no `.xy/cache/incremental` snapshot, so `xy build` runs in full. Do not restore a stale `.xy/cache`.
- Never pass `--fix` in CI.

To also gate repository policy, run `pnpm xy check --strict` after the build (publint compares export maps with compiled output):

- First set git config with plain git: `git config core.autocrlf false && git config core.eol lf`, plus `git config core.ignorecase false` on case-insensitive filesystems. A fresh clone has neither of the first two keys, so `git.autocrlf` and `git.eol` warn and fail `--strict`. Do not use `xy git lint --fix` for this; it can also rewrite `.gitignore`.
- In 10.1.1, `--strict` does not escalate agent-lint or skills-lint warnings inside `xy check`, and the standalone linters ignore `XY_STRICT=1`. When those warnings must block, also run `pnpm xy agent lint --strict` and `pnpm xy skills lint --strict`.
- `xy check` is not hermetic and has no `--offline`. `skills.required-current` fetches upstream skill versions: offline it passes silently, online a new skill release can fail CI with no repository change. Once agent-lint warnings gate, `docs.stale` depends on today's date and `docs.evidence-immutable` needs full history (`fetch-depth: 0`).

## Dependency and publish analysis

### `xy deplint [package]`

Analyze imports against `dependencies`, `devDependencies`, and `peerDependencies`. Detect unlisted, unused, misplaced, redundant, unsatisfied, unrequested, version-mismatched, range-style, and workspace-protocol problems. Use `--fix` for supported changes, then inspect `package.json` and rerun cleanly. Narrow a run with `-d` / `-D` / `-P` (one manifest section) or `-e, --exclude <paths>` (skip source paths). `pnpm xy deplint --rules` lists the catalog; old `deplint.*` rule ids are deprecated aliases of `dep.*`.

Most deplint rules default to warnings. Since 10.0.3, `dep.dependencies.not-public` and `dep.peerDependencies.not-public` are errors with no auto-fix, so they block `xy build`:

- A package is public when it is not `private` and is either unscoped or sets `publishConfig.access: 'public'`. A scoped package without `access` counts as restricted.
- A public package may not list, in `dependencies` or `peerDependencies`, a package that is not publicly published on npm, a private or restricted workspace sibling, or a non-registry spec (`file:`, `link:`, `portal:`, `catalog:`, `patch:`, `npm:` aliases, git).
- Fix by hand: publish the dependency, switch to a published registry range, drop it, or make the consumer private.

Choose the dependency/peer classifier deliberately. The default is `legacy`; override it per repository with `commands.deplint.classifier` or per run with `--classifier`:

- `legacy` promotes external runtime dependencies of libraries toward peers.
- `aei` uses API Exposure Index evidence and leaves borderline cases for review.
- `aei-next` also supports `peer-with-default` when the install-strategy heuristics match.

#### Package roles

Deplint auto-detects a package **role** (`library`, `library/cli`, `cli`, `service`, `app`, `workspace-root`, `tooling`) and applies policy facets. Agents must not treat every private package as free to demote runtime deps to `devDependencies`.

Critical cases:

- **`service` / `cli` with a trusted runtime graph:** keep real runtime deps in `dependencies`. Demoting them breaks `pnpm install --prod` and Docker slim images.
- **`private: true` is not a service signal.** A private package with a real `main` / `exports` surface remains a **library**.
- Progress labels use role ids (`service`, `cli`, …), not legacy `terminal[private]` / `terminal[cli]`.
- Prefer `commands.deplint.role` (and optional `runtimeRoots` / facets) over deprecated `terminal: true`.

Full role table, facets (`prodInstallMatters`, trusted graphs, `runtimeEntry`), and override examples: [project-profiles.md](project-profiles.md#package-roles-and-dependency-policy).

#### Package placement and presence

Configure exceptional packages through `commands.deplint.packages`. Separate where a package belongs from whether its declaration must exist:

```ts
import type { XyConfig } from '@ariestools/toolchain'

const config: XyConfig = {
  commands: {
    deplint: {
      packages: {
        typescript: { placement: 'dev' },
        'eslint-plugin-example': {
          placement: 'dev',
          presence: 'allowed',
        },
        react: {
          placement: 'peer',
          presence: 'required',
        },
      },
    },
  },
}

export default config
```

Use `placement` to control the manifest section whenever a dependency is declared or discovered:

- `dep` selects `dependencies`.
- `dev` selects `devDependencies`.
- `peer` selects `peerDependencies`; when deplint adds a required or promoted peer, it also adds the development companion.
- `peer-with-default` intentionally selects both `dependencies` and `peerDependencies`.

Use `presence` independently:

- `inferred` is the default. Source and peer-chain evidence decide whether the declaration exists; `placement` alone does not retain an unused declaration.
- `allowed` retains a declaration that static analysis cannot justify but does not add it when absent. Use it for dynamically or convention-loaded plugins and similar dependencies invisible to source scanning.
- `required` adds and retains a missing declaration. Always pair it with `placement`; `dep.package.required` reports and can fix the missing manifest entry.

A per-package entry also accepts `peerOptional` to force `peerDependenciesMeta[<name>].optional`; by default it is optional only when every requiring dependency marks it optional.

Treat `refType` as deprecated. Its historical behavior combines placement with allowed presence: `refType: 'dev'` is equivalent to `{ placement: 'dev', presence: 'allowed' }`. Do not migrate mechanically to `{ placement: 'dev' }` unless unused-removal behavior is intended.

Placement overrides also inform `xy api-exposure`. Root and package `commands.deplint.packages` entries deep-merge, so a root placement can combine with a package-level presence override. Keep package-role classification separate from these per-dependency policies, and do not distort source imports to satisfy an inappropriate classifier default.

Other `commands.deplint` fields: `classifier` (default `legacy`), `exclude` (workspace-relative globs skipped by source scanning, for generated trees such as release folders), `plugins` (extra rule modules), `rules`, and the role facets `role`, `hasImportConsumers`, `peerTarget`, `allowMoveToDev`, `prodInstallMatters`, `runtimeEntry`, and `runtimeRoots`, which derive from the role when unset.

#### Interactive pick

Use `xy deplint pick` for an interactive table of borderline AEI packages (`dep.dependencies.aei-review`, reported only under the `aei` and `aei-next` classifiers) plus every package already listed under `commands.deplint.packages` in the monorepo's `xy.config` files:

```sh
pnpm xy deplint pick
pnpm xy deplint pick @scope/package
```

Space cycles each row through `none` / `dep` / `dev` / `peer`; Enter writes the chosen placements into the appropriate `xy.config`. `none` removes a `dep` / `dev` / `peer` entry but keeps existing `peer-with-default` and presence-only entries. After picking, run `xy deplint --fix` to apply placements to `package.json` manifests. Redundant placement overrides that match the active classifier can be cleaned with `--fix` via `dep.package.redundant-placement`.

### `xy api-exposure [package]`

Measure how a package's public runtime and type surface couples consumers to each dependency. Use `--dep` to narrow analysis, `--min-band` to filter output, and `--fail-on` for an explicit automation threshold. Treat results as dependency-placement evidence, not as a mechanical peer-dependency mandate.

### `xy publint [package]`

Validate the npm package surface, including upstream publint checks, compiled output/export-map parity, platform portability, export condition order, published files, source leakage, side effects, root legacy fields, dependency resolutions, workspace peer ranges, and `#imports`/exports alias parity. `pub.publint`, `pub.platform`, and `pub.importsMatchExports` are errors by default.

`pub.importsMatchExports` (since 10.0.9) requires every exact `#alias` in `package.json` `imports` to select the same runtime file as its same-named public subpath under every condition; otherwise a consumer that reaches both loads two module instances. It has no auto-fix; see [Monolith mode](compilation.md#monolith-mode).

Use `--fix` for XY-managed fixable rules; it cannot fix every upstream publint error, and it will not add an export condition that the subpath's `#alias` does not also select. Narrow a run with `--include` / `-e, --exclude <checks>` (comma-separated check names; `peerDeps` runs only on all-workspace runs), and use `--fresh` to clear the incremental snapshot. `--no-pack` skips published-files verification, so do not use it for gates.

### `xyex dead [package]` (experimental)

Analyze declaration liveness at package, repository, and active editor-workspace scope; `--workspace <file>` names the `*.code-workspace` file used by workspace-scoped rules. Use `--deprecated` to report consumed deprecated exports. Run `--fix` first; it adds deprecation markers. `--fix-remove` removes dead declarations and cascades supported cleanup: run it only on a clean git tree, review the diff, then rerun compile and tests. Flags and `commands.dead` settings may change on a minor release.

### `xy license` and `xy secure`

Use `xy license` to check production dependency licenses against the configured allowlist.

Since 9.0.1, `xy secure` is an overview that runs both security audits and prints a summary line each, pointing at the subcommands for detail (9.0.0 has only the dependency audit):

| Command | Behavior |
|---|---|
| `xy secure deps [package]` (since 9.0.1; on 9.0.0 run `xy secure [package]`) | Audit direct dependency age and download metadata. Not a vulnerability scanner — it reports no CVEs. |
| `xy secure dependabot` (since 9.0.1) | Report GitHub Dependabot security alerts via the `gh` CLI |

`xy secure dependabot` needs `gh` installed and authenticated; the standard `repo` scope suffices. Alerts are enabled per repository, and a repo with the feature off is reported as such, not as a failure. Flags: `--org <name>` (sweep a whole org), `--scope`, `--relationship`, `--state`, `--summary`, `--rules`.

Findings are rule-bearing: `dependabot.critical` / `.high` / `.medium` / `.low`, plus `dependabot.alerts-enabled`. Alerts are overwhelmingly transitive lockfile findings, so nothing fails by default (`critical` and `high` warn; `medium` and `low` are off) — raise levels under `commands.dependabot.rules` to gate. A typed `XyConfig` rejects that key in 10.1.1; use the [untyped command keys](#untyped-command-keys) workaround. Console output caps at 50 alerts and reports how many were held back; `--json` carries every finding.

### `xyex npm-org lint [org]` (experimental)

Since 10.0.7, lint every package published in an npm organization (`ariestools` or `@ariestools`). It is not part of `xy check`.

| Rule | Default | Meaning |
|---|---|---|
| `npm-org.stale-usage` | warn | Last-week downloads at or below `minWeeklyDownloads` (default 10) |
| `npm-org.stale-development` | warn | Latest version published at least `maxAgeDays` ago (default 365) |

Configure under `commands.npmOrgLint` (`minWeeklyDownloads`, `maxAgeDays`, `includeDeprecated`, `rules`); `--min-downloads`, `--max-age-days`, and `--include-deprecated` override them per run. Packages whose latest version is deprecated are skipped by default. Weekly download counts are cached for 12 hours under `.xy/cache/npm-downloads/` (`XY_NPM_DOWNLOADS_CACHE=0` disables it), and a downloads-API 404 counts as zero.

## Repository policy

Use the focused command when diagnosing one policy family:

| Command | Policy | In `xy check` |
|---|---|---|
| `xy agent lint` | AGENTS.md, tool adapters, and the `docs/` / `papers/` convention (since 10.1.1); see [Documentation conventions](#documentation-conventions) | Yes, first |
| `xy git lint` | Git config (`core.autocrlf` false, `core.eol` lf, `core.ignorecase` false) and a `.gitignore` entry that ignores `.xy/cache` in every package (`git.ignore-toolchain-cache`, since 9.1.1) | Yes |
| `xy packman lint` | pnpm `minimumReleaseAge`, `minimumReleaseAgeExclude`, and `verifyDepsBeforeRun`, and Yarn `enableScripts: false`; all errors, fixable once `pnpm-workspace.yaml` exists | Yes |
| `xy repo lint` | Monorepos only: workspace layout (`packages/` folder, glob coverage), versions and internal ranges, engines and Volta, package-manager fields, pnpm release age and overrides, spec layout, a consumer `README.md` per package and its `files` entry (since 10.0.5), and Dependabot enablement | Yes |
| `xy lint lint` | Local ESLint config package, `.gitignore` parity, redundant rules, and overrides | Yes |
| `xy skills lint` | Required catalog skills, versions, duplicate global installs, and catalog skills that are neither required nor optional for the tier nor `allowed` in config; see [`xy skills`](#xy-skills) | Yes |
| `xy node lint` | Root Volta pin and package `engines.node` portability | No; run `xy node lint [--fix]` on its own |

`xy check` also runs publint. `xy check --fix` applies the fixable forms of the families `xy check` runs; `xy fix` covers a different set (see [Lifecycle gates](#lifecycle-gates)). Run it locally, never in CI, review the diff, then rerun without `--fix`. For CI, see [CI gates](#ci-gates).

Since 10.1.1, `xy check --fix` also runs agent lint's fixers. They replace `docs/README.md` with the generated index, discarding a hand-written one, and prepend `kind: doc` front matter to `docs/`, `papers/`, and `specs/` files that lack it. Upgrading to 10.1.1 adds this gate, so after an upgrade:

1. Run `pnpm xy agent lint` without `--fix`.
2. Scaffold missing files with `pnpm xy agent init`, which never overwrites.
3. In a repo with a hand-maintained docs index, set levels under `commands.agentLint.rules` before fixing.
4. After a front-matter fix, run `pnpm xy agent index`. One run lints the pre-fix documents, so an immediate rerun still fails `docs.index-current`.

A new workspace package needs a `README.md` or `xy check` fails; `xy repo lint --fix` scaffolds one. List every repo rule with `pnpm xy repo lint --rules`.

`xy repo lint` includes `repo.dependabot-enabled` (since 9.0.1), which warns when GitHub Dependabot alerts are switched off for the repository and enables them under `--fix` (needs admin on the repo; reports the finding as still open when the token cannot). It stays silent when `gh` is missing, unauthenticated, or the remote is not GitHub.

`repo.engines-lts` (error) and `node.volta-node-latest` compare against the latest Node **Current** release by default. With that default, an `engines` range that excludes the latest Current errors, an older `volta.node` warns (failing `--strict`), and `xy node lint --fix` bumps an LTS `volta.node` pin to the latest Current. Repos that deliberately track Node LTS set both tracks (since 10.0.7):

```ts
const config: XyConfig = {
  commands: {
    nodeLint: { nodeTrack: 'lts' },
    repoLint: { nodeTrack: 'lts' },
  },
}
```

## Documentation conventions

### `xy agent`

Since 10.1.1, the stable `xy agent` family checks and maintains the AGENTS.md and `docs/` convention described by the [xy-agent skill](../xy-agent/SKILL.md). `xy check` runs `agent lint` first, with no config entry required.

| Command | Behavior |
|---|---|
| `xy agent lint [--fix] [--strict] [--rules]` | Lint AGENTS.md, tool adapters, and `docs/` / `papers/` / `specs/` documents |
| `xy agent audit [--strict]` | Report stale, orphaned, superseded-but-unarchived, live-state, and edited-evidence documents (a five-rule subset) |
| `xy agent init` | Scaffold AGENTS.md, a `CLAUDE.md` containing only `@AGENTS.md`, `docs/{decisions,runbooks,plans,evidence,archive}/`, and `docs/README.md`; never overwrites |
| `xy agent index` | Regenerate `docs/README.md` from document front matter |
| `xy agent archive <path>` | Move a document under `docs/archive/` and refresh the index |

The error-level rules are `agents.file-present`, `agents.required-sections` (orient, authority, repository map, commands, and failures sections), `agents.adapter-thin` (a `CLAUDE.md` adapter is only an `@AGENTS.md` import or a symlink to AGENTS.md), `agents.links-resolve`, `agents.no-absolute-paths`, and `docs.index-current`. The rest warn. Only `docs.front-matter` and `docs.index-current` are fixable. `commands.agentLint.rules` changes levels only, and unknown rule ids are errors. List the catalog with `pnpm xy agent lint --rules`.

### `xyex plan` (experimental)

Since 9.2.1, `xyex plan init` writes a non-governing `.xy/plan.json` bootstrap, and `xyex plan lint [--fix]` checks a fixed root / `papers/` / `docs/` / `notes/` layout (its root-document rules since 10.0.5) configured by `commands.planLint.rules` (levels only). Neither runs in `xy check`, and `plan lint` is not authoritative for the xy-agent convention. Its layout differs: it requires `papers/WHITE-PAPER.md`, `papers/YELLOW-PAPER.md`, `notes/README.md`, and templated `docs/README.md` and `docs/ROADMAP.md`, while `docs.index-current` requires `docs/README.md` to equal the generated index. Do not run `plan lint --fix` in a repo that passes `xy agent lint`.

## Skills and work tracking

### `xy skills`

`xy skills` wraps the bundled Skills.sh CLI. Only `defaults`, `lint`, and `pick` are XY-specific; `add`, `update`, `list`, `remove`, `find`, and the other subcommands pass through to Skills.sh, so `xy skills --help` prints Skills.sh help. Use `xy skills lint --help` for the XY options.

| Command | Behavior |
|---|---|
| `xy skills defaults [-g] [-a <agent>] [--copy]` | Install every ariestools-skills skill plus the xyo-skills XYO/XL1 stack |
| `xy skills lint [--fix] [--offline] [--strict] [--rules]` | Check required skills, versions, and duplicates; runs in `xy check` |
| `xy skills add <source> --skill <name> -y` | Install one skill (passthrough) |
| `xy skills remove <name> -y` | Remove one skill (passthrough) |

`xy skills lint` manages a catalog of ten skills (nine before 9.2.0, without xl1-dapp-kit): xy-development, xy-toolchain, ariestools-sdk, xyo-knowledge, and the xl1-* skills. A skill reaches the required set in four ways:

1. **Tier detection.** The lint detects a repo tier from package.json and toolchain signals (unrelated to the package profiles in [project-profiles.md](project-profiles.md)). It also requires ariestools-sdk when the repo produces or uses sdk-js packages and, since 10.0.8, xl1-dapp-kit when it produces or depends on `@xyo-network/dapp-kit` packages.

   | Tier | Required | Optional |
   |---|---|---|
   | `xy` | xy-development, xy-toolchain | — |
   | `xyo` | adds xyo-knowledge | — |
   | `xl1` | adds xl1-knowledge, xl1-patterns, xl1-testing | xl1-dapp-kit, xl1-scaffold, xl1-build |

2. **`commands.skillsLint.additionalSkills`** (since 10.0.5) lists catalog skills to require regardless of tier. Root and workspace lists are unioned, and unknown names are config errors.
3. **`commands.skillsLint.skills`** (since 10.1.1) sets `{ '<name>': { presence: 'required' | 'allowed' | 'off' } }`. `required` adds the skill. `off` drops a tier requirement; a still-installed skill then warns as `skills.unnecessary`, and `off` never silences `skills.package-recommended`. `allowed` only suppresses `skills.unnecessary`, and the skill is not version-checked.
4. **package.json `xy.skills`** (since 10.0.8) lists `[{ name, source? }]` on workspace packages and direct dependencies. `source` is needed only for a skill outside the catalog. The config loader reads a package.json `xy` key before any xy.config file and stops there, so the key becomes that directory's entire xy config. It hides a sibling xy.config.ts, and in a package without one it also hides the root config from `xy compile`, which then ignores the root `compile` block (see [Configuration](compilation.md#configuration)). Add `xy.skills` only to a package with no xy.config.ts that needs no root compile settings, or repeat those settings, such as `compile: { node: true }`, inside the same package.json `xy` object.

| Rule | Level | Meaning |
|---|---|---|
| `skills.required-installed` | error | Required skills are installed |
| `skills.required-current` | error | Installed required skills match upstream (network; skipped with `--offline`) |
| `skills.migrated-source` | error | xy-development and xy-toolchain come from ariestools-skills, not xyo-skills |
| `skills.package-recommended` | error | Skills named in `xy.skills` are installed |
| `skills.unnecessary` | warn | Installed catalog skills that are not required, optional, `allowed`, or package-recommended |
| `skills.duplicate-install` | warn | Project skills are not also installed globally |

`xy skills lint --fix` works in project scope. It installs missing required and package-recommended skills, migrates xyo-skills-sourced xy-development and xy-toolchain installs to ariestools-skills, and updates outdated required skills (migration and updates since 9.2.0). It never removes anything. Skills outside the catalog, including xy-agent and retired `xylabs-*` skills, are never version-checked, and are reported only when a package.json `xy.skills` entry names one that is missing; remove unwanted ones with `xy skills remove <name> -y` (see [legacy agent files](toolchain.md#legacy-agent-files-from-xy-claude)).

xy-agent is not in the catalog. `xy skills defaults` installs it with the rest of ariestools-skills, but naming it in `additionalSkills`, `skills`, or `pick` is a config error that makes `xy skills lint` and `xy check` exit 1. Add it with `pnpm xy skills add ariestools/ariestools-skills --skill xy-agent -y`, or list it with its `source` in a package.json `xy.skills` (mind the config caveat above).

`xy skills pick [--skill <name>]` (since 10.1.1, needs `--skill` without a TTY) installs catalog skills and records each as `required`, but it rewrites `xy.config.ts`: the whole file when it has no `skills:` key, otherwise that block with only this run's picks, dropping earlier entries such as `allowed` / `off`. Do not use it on an existing config. Edit `commands.skillsLint.skills` by hand, which is also the only way to record `allowed` or `off`, and install with `xy skills add`.

### `xyex work` (experimental)

`xy work` stores AI-friendly work items under `.xy/work/` (canonical local storage: `.xy/work/items/*.json`). Prefer it over free-form TODO notes when the repository adopts work tracking. It is experimental: run it as `pnpm xyex work …` (see [channels](#stable-and-experimental-channels)), and expect flags and storage to change on a minor release.

```sh
pnpm xyex work init
pnpm xyex work add bug "Describe the problem" --area deplint --file src/index.ts --line 42 \
  --acceptance "Reproduction passes" --verify "pnpm xy build" --impact 4 --urgency 2
pnpm xyex work list --status open --sort priority
pnpm xyex work list --all
pnpm xyex work sync
pnpm xyex work triage
pnpm xyex work queue --limit 10
pnpm xyex work next --claim
pnpm xyex work done <id> --evidence "pnpm xy build passed"
pnpm xyex work update <id> --status blocked --blocked-reason "…"
pnpm xyex work lint
```

| Command | Purpose |
|---|---|
| `work init` | Create the repo-local work store and config |
| `work add <type> <title>` | Capture a bug, todo, feature, idea, debt, research, question, or risk |
| `work list` | List local items; filter with `--status` and `--type`, order with `--sort created\|priority` |
| `work list --all` | Also list open GitHub issues **not** created by `xy work`, normalized as `GH-<number>` |
| `work sync` | Bidirectional reconcile of local items and GitHub Issues when available |
| `work triage` | List open items missing triage fields |
| `work queue` / `next` | Build a priority-sorted queue (`--name`, `--limit`, `--status`) and show its next item |
| `work claim` / `update` / `done` / `show` | Lifecycle operations; `done` requires `--evidence` |
| `work move <id> --to <folder>` | Move an item between multi-root workspace folder repos |
| `work lint` | Store health (gitignore, GitHub availability, sync drift) |

`add` and `update` take the triage fields `--description`, `--area`, `--tag`, `--acceptance`, `--verify` (the last three repeatable), and `--impact` / `--urgency` / `--effort` / `--risk` / `--confidence` (each 1–5). Only `add` takes the anchor flags `--file`, `--line`, and `--inline`. An open item missing area, priority, acceptance criteria, or verification is under-triaged and shows in `work triage`.

Choose the type by intent: `bug` (existing behavior is wrong), `todo` (known concrete work), `feature` (new capability), `idea` (speculative, no acceptance criteria yet), `debt` (internal cleanup), `research` (investigation before implementation), `question` (unresolved decision), or `risk` (known risk to track).

Record verification evidence when completing an item. Do not initialize work tracking merely because the command exists; follow repository policy.

**Claiming is not atomic.** `claim` overwrites the item with a timestamp; there is no lock or lease. Use `claim` and `next --claim` only in single-agent, single-worktree flows. Across worktrees or concurrent agents, queue work instead.

For machine-generated items, such as audit findings:

- **Get consent before the first `work` command.** In a repository with no `.xy/work/config.json`, any `work` command (`list` included) creates the store with GitHub dual-write on. From then on, each new item opens a real issue whenever `gh` is authenticated, or at the next `work sync` if it was not. GitHub dual-write has no per-item opt-out. The only switch is `stores.github.enabled: false`, which is repo-wide and also stops `work sync`, so it is the operator's call.
- **Deduplicate by anchor and tag, not by id.** Ids are a date plus a random suffix, generated fresh on every call. `work add` has no `--id` flag, and `@ariestools/toolchain` ships no runtime API to pass one. Anchor each item with `--file` and give the batch a fixed `--tag`. Before adding, look in `pnpm xyex work list --json` for an item whose `anchors[].path` and `tags` match, and run `pnpm xyex work update <id>` on it instead of adding a second one.
- **Supply the triage fields** (area, priority, acceptance criteria, verification) so the items do not drown `work triage`.
- **Close the loop.** `work done <id> --evidence …` and `work update <id> --status wontfix` change only the local item. Run `work sync` to close the linked GitHub issue.

| Lint rule | Level | Meaning |
|---|---|---|
| `work.store-not-gitignored` | error | `.xy/work` is tracked; ignore only `**/.xy/cache/`, never `.xy` |
| `work.github-available` | warn | GitHub Issues are reachable when dual-write is enabled |
| `work.github-synced` | warn | Local items and GitHub Issues are in sync |

Set levels under `commands.workLint.rules`; a typed `XyConfig` rejects that key in 10.1.1, so use the [untyped command keys](#untyped-command-keys) workaround.

#### GitHub Issues integration

When `stores.github.enabled` is true (the default for new stores) and the GitHub CLI (`gh`) is installed, authenticated, and the repo has a GitHub remote:

- **`work add`** dual-writes a GitHub issue marked as created by `xy work`:
  - label: `xy-work`
  - body marker: `<!-- xy-work: <id> -->`
  - footer noting creation by the `xy work` tool
  - link stored on the local item under `stores.github` (`number`, `url`, `createdByXyWork: true`)
- If GitHub is unavailable or create fails, the local item is still written.
- **`work list --all`** includes open external GitHub issues (no `xy-work` label/marker, not already linked) as normalized `GH-<number>` rows for display; type is inferred from labels when possible.
- **`work sync`** reconciles when available:
  - Local active items without a GitHub link → create a marked issue
  - GitHub issues not present locally → import (`XYW-…` id when marked, else `GH-<number>`)
  - Linked pairs: newer title wins; local `done`/`wontfix` closes the issue; closed GitHub issues mark local done
  - Since 10.1.0, sync edits or closes a GitHub issue only when its body marker and stored URL match the local item.

Disable dual-write and sync in `.xy/work/config.json`:

```json
{
  "stores": {
    "github": { "enabled": false }
  }
}
```

Use inline source markers only as anchors (`// xy-work: <id>`, or `<!-- xy-work: <id> -->` in Markdown and HTML, which `--inline` inserts); keep priority, acceptance, and verification on the work item.

#### Multi-folder editor workspaces

When several git repos are open together (for example `GitHub.code-workspace`), work subcommands accept scope flags:

| Flag | Behavior |
|---|---|
| `--workspace` | Operate across folders in the active/local `*.code-workspace` |
| `--workspace-file <path>` | Explicit workspace file (implies `--workspace`) |
| `--repo <name>` | Limit or target a single workspace folder by name |

```sh
pnpm xyex work list --workspace
pnpm xyex work list --workspace --repo toolchain
pnpm xyex work move XYW-20260724-A145D1 --to sdk-js --from toolchain
```

`work move` relocates a work item between workspace folder repos. Use `--from` when the id is ambiguous across folders. Do not invent cross-repo moves without an actual multi-root workspace layout.

## Clean

### `xy clean [package]`

Remove build artifacts (`dist`, `build`, and configured patterns). Array fields in config cascade (union) from root to package.

| Flag | Behavior |
|---|---|
| *(default)* | Clean built-in and configured patterns, subject to safety rules and excludes |
| `--full` | Also remove all gitignored files under each package (fresh-clone hygiene); still honors `commands.clean.exclude` and default excludes such as `node_modules` |
| `--full-all` | Like `--full`, but also ignores `exclude` / default excludes; only `.git` remains protected |
| `--rules` | List the clean rules and their effective levels |

Configure under `commands.clean` in `xy.config.ts`:

```ts
import type { XyConfig } from '@ariestools/toolchain'

const config: XyConfig = {
  commands: {
    clean: {
      patterns: ['coverage', '.turbo'],
      include: ['tmp/**'],
      exclude: ['.cache'],
      rules: {
        'clean.gitignored-only': 'error', // default: only delete gitignored matches for configured patterns
        'clean.gitignored-all': 'off', // default: off; enable to wipe every gitignored path under the package
      },
    },
  },
}

export default config
```

- `patterns` — extra package-relative globs beyond builtins.
- `include` — always cleaned; bypasses `clean.gitignored-only`, still subject to hard safety and `exclude`.
- `exclude` — never cleaned (plus immutable `.git` and default `node_modules` excludes).
- Hard rules `clean.inside-root` and `clean.relative-pattern` always apply and cannot be turned off.

Prefer `xy clean` over ad-hoc `rm -rf dist`. Use `--full` only when you intend fresh-clone hygiene; use `--full-all` only when you intentionally want to delete excluded trees such as `node_modules` under packages.

## Releasing (owner-directed)

Check the repository's release workflow first; release-please or CI may own versioning and publishing. Run these commands only when the owner directs it.

| Command | Behavior |
|---|---|
| `xy deploy [patch\|minor\|major\|prerelease]` | Bump every lockstep package (default `patch`), run `xy clean` and `xy build`, then apply the version |
| `xy publish [--tag <dist-tag>] [--chunk-size <n>]` | Publish workspaces to npm; `--chunk-size` is pnpm-only, and each chunk triggers its own 2FA prompt |

Publish prereleases under an explicit dist-tag (`pnpm xy publish --tag next`, since 9.2.0) so `latest` stays on stable cuts. Since 10.1.1, both commands ignore a same-named root `package.json` script and run the toolchain implementation unless `--defer` is passed (see [Global flags](#global-flags)). A repo whose root `deploy` script does something else, such as a hosting deploy, must pass `--defer` or run that script directly.

## Dependency maintenance and utilities

| Command | Behavior |
|---|---|
| `xy install` | Install with the detected package manager |
| `xy reinstall` | **Destructive:** delete `node_modules` and lockfiles (`packman clean`), then install |
| `xy up` | Report outdated dependencies |
| `xy updo [--latest] [--next] [--risk green\|yellow\|red]` | Update dependencies interactively; never offers `typescript` past major 6 |
| `xy gitignore` | **Destructive:** regenerate the root `.gitignore` and delete package `.gitignore` files |
| `xy npmignore-gen` | Generate `.npmignore` files |
| `xy statics` | Report singleton dependencies (such as `react`) installed in more than one version; fails only under `--strict` |
| `xy copy-assets [package]` | Copy assets from `src` to `dist` |

Since 10.1.1, `commands.updo.ignoreDeps` keeps declarations out of the updo chooser, for example `updo: { ignoreDeps: ['satori', '@vendor/*'] }`:

- Entries are exact `package.json` keys or positive globs; an `npm:` alias matches by its alias key.
- Root and package lists add together.
- Matching declarations are never rewritten, but the installed tree is not pinned.
- updo ignores pnpm's `update.ignoreDeps`; pnpm's `minimumReleaseAge` still filters candidate versions.
- An invalid entry (a negation, an empty string, or a non-array) fails before any manifest is written.

## Configuration and automation

Put rule levels and command settings under `commands` in `xy.config.ts`:

```ts
import type { XyConfig } from '@ariestools/toolchain'

const config: XyConfig = {
  commands: {
    deplint: {
      classifier: 'aei',
      rules: {
        'dep.workspace.protocol': 'error',
      },
    },
    publint: {
      rules: {
        'pub.sideEffects': 'error',
      },
    },
  },
}

export default config
```

The default `dep.workspace.protocol` is `workspace:~`. The rule also accepts a `protocol` option (`'workspace:*' | 'workspace:^' | 'workspace:~'`), but a typed `XyConfig` rejects the `[level, { protocol }]` form in 10.1.1.

| Key | Fields (defaults) |
|---|---|
| `commands.deplint` | See [`xy deplint`](#xy-deplint-package) |
| `commands.publint` | `include` or `exclude` check names, `pack` (`true`), `rules` keyed `pub.<check>`. `publint: false` type-checks but is ignored; turn checks off with `rules` or `exclude` |
| `commands.apiExposure` | `packages[name].classification`, `peerForwarding` (`'when-exposed'`, or `'always'` / `'when-used'`), `peerWithDefault` (`false`), `rules`, `thresholds` (39 / 79 / 119 / 179), `treeShaking` (`true`). Deplint also reads it under `aei` / `aei-next` |
| `commands.license` | `allow` (added to the defaults), `allowOnly` (replaces them), `deny`, `ignorePackages` (`name` or `name@version`) |
| `commands.packman` | `minimumReleaseAge` (minutes, `1440`), `minimumReleaseAgeExclude`. The lint requires exactly the `@ariestools/*`, `@xylabs/*`, and `@xyo-network/*` scopes the repo uses |
| `commands.repoLint` / `commands.nodeLint` | `nodeTrack` (`'current'` or `'lts'`, since 10.0.7), `rules` |
| `commands.agentLint` | `rules`, levels only (since 10.1.1) |
| `commands.skillsLint` | `additionalSkills` (since 10.0.5), `skills` presence map (since 10.1.1), `rules` |
| `commands.updo` | `ignoreDeps` (since 10.1.1) |
| `commands.clean` | See [Clean](#clean) |
| `commands.dead`, `commands.workLint`, `commands.planLint`, `commands.npmOrgLint` | Experimental-command settings; may change on a minor release |

Inspect the installed catalog before inventing rule IDs:

```sh
pnpm xy --rules
pnpm xy deplint --rules --json
pnpm xy check --rules
```

Validate every fixer with three checks: the finding appears before the fix, `--fix` makes the intended scoped edit, and a second non-fix run is clean.

### Untyped command keys

`CommandsConfig` has no `dependabot` or `workLint` key in 10.1.1, so a literal `commands: { dependabot: … }` in a typed `XyConfig` fails with TS2353 (and breaks package type validation when `xy.config.ts` sits inside a package tsconfig). The runtime still reads both. Hoist the whole `commands` object into a const that keeps at least one typed key (for example `deplint: {}`) and assign it. A non-literal object is not excess-property checked. Do not spread an inline literal: `unicorn/no-useless-spread` errors on it, and its autofix restores the TS2353 form.

```ts
const commands = {
  deplint: {},
  dependabot: { rules: { 'dependabot.high': 'error' as const } },
}

const config: XyConfig = { commands }
```
